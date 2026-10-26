"""github.com:443 不通时，用 Git Data API 把当前 HEAD 的改动推到远端 main。

用法：python api_push.py <repo_dir> <owner/repo>
只推送 HEAD 相对 HEAD^ 的改动（新增 / 修改 / 删除），在远端最新 commit 之上重建一个等价提交。
"""
import base64
import json
import subprocess
import sys
import urllib.request

API = "https://api.github.com"


def run(cwd, *args):
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()


def token():
    out = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n\n",
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    for line in out.splitlines():
        if line.startswith("password="):
            return line.split("=", 1)[1]
    raise SystemExit("no credential found")


def call(method, path, payload=None, tok=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header("Authorization", f"Bearer {tok}")
    req.add_header("Accept", "application/vnd.github+json")
    if data:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())


def main():
    repo_dir, slug = sys.argv[1], sys.argv[2]
    base_ref = sys.argv[3] if len(sys.argv) > 3 else None
    tok = token()
    run(repo_dir, "git", "-c", "http.proxy=", "config", "core.quotepath", "false")

    head = run(repo_dir, "git", "rev-parse", "HEAD")
    parents = run(repo_dir, "git", "rev-list", "--parents", "-n", "1", "HEAD").split()[1:]
    message = run(repo_dir, "git", "log", "-1", "--pretty=%B", "HEAD")
    diff_from = base_ref or parents[0]
    print("diff from:", diff_from)
    diff = run(repo_dir, "git", "diff", "--name-status", diff_from, head)
    changes = [line.split("\t") for line in diff.splitlines() if line.strip()]
    print("changes:", changes)

    ref = call("GET", f"/repos/{slug}/git/ref/heads/main", tok=tok)
    base_sha = ref["object"]["sha"]
    base_tree = call("GET", f"/repos/{slug}/git/commits/{base_sha}", tok=tok)["tree"]["sha"]
    print("remote head:", base_sha, "tree:", base_tree)

    entries = []
    for row in changes:
        status, path = row[0], row[-1]
        if status == "D":
            entries.append({"path": path, "mode": "100644", "type": "blob", "sha": None})
            continue
        with open(f"{repo_dir}/{path}", "rb") as fh:
            content = base64.b64encode(fh.read()).decode()
        blob = call("POST", f"/repos/{slug}/git/blobs", {"content": content, "encoding": "base64"}, tok=tok)
        mode = "100755" if run(repo_dir, "git", "ls-files", "-s", path).startswith("100755") else "100644"
        entries.append({"path": path, "mode": mode, "type": "blob", "sha": blob["sha"]})
        print("blob", path, blob["sha"][:7])

    tree = call("POST", f"/repos/{slug}/git/trees", {"base_tree": base_tree, "tree": entries}, tok=tok)
    commit = call(
        "POST",
        f"/repos/{slug}/git/commits",
        {"message": message, "tree": tree["sha"], "parents": [base_sha]},
        tok=tok,
    )
    call("PATCH", f"/repos/{slug}/git/refs/heads/main", {"sha": commit["sha"]}, tok=tok)
    print("pushed:", commit["sha"][:7], "tree local:", run(repo_dir, "git", "rev-parse", f"{head}^{{tree}}")[:7])


if __name__ == "__main__":
    main()
