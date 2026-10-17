---
title: LangChain 详解：从一次模型调用到能干活的 Agent
date: 2026-10-15
description: 把 LangChain 从「一堆 create_xxx 的胶水库」讲到「一套可组合的运行时」：包结构、六大核心抽象、LCEL、Agent 与 LangGraph 的边界、版本迁移的坑，以及什么时候根本不该用它。
tags: [LangChain, 大模型, Agent, 工程实践]
cover: covers/langchain.png
---

很多人对 LangChain 的第一印象是"把大模型调用包了一层的胶水库"，第二印象是"教程里那堆 `create_xxx` 函数又长又乱"。这两个印象都不算错，但都停在 2024 年。

2025 年 10 月 LangChain 发布 v1，做了一次相当彻底的瘦身：主包里大部分历史包袱被挪到 `langchain-classic`，官方推荐的入口收敛成一个 `create_agent`，底层则完全交给 LangGraph 运行。换句话说，它从一个"什么都能拼的链式工具库"，变成了"一套围绕 Agent 的运行时 + 一组稳定的抽象接口"。

这篇文章按我自己的理解顺序来写：

> 它到底解决什么问题 → 包结构长什么样 → 六个核心抽象 → LCEL 与 Agent 的分工 → 什么时候要下沉到 LangGraph → 版本迁移的坑 → 什么情况下**不该**用它。

如果你看过我上一篇 [关于 RAG 的看法和总结](/blog/about-rag)，那篇讲的是"知识怎么喂给模型"，这篇讲的是"喂的过程用什么工具组织起来"。两篇配合着看比较完整。

---

## 一、先说清楚它解决什么问题

假设不用任何框架，直接调 SDK 写一个"能查资料再回答"的程序，你大概要重复这些活：

1. **多模型适配**。今天用 OpenAI，明天换成 DeepSeek，后天客户要求私有化部署 Qwen。每换一次，`messages` 格式、工具调用字段、流式事件结构都得改一遍。
2. **提示词拼装**。把用户输入、检索到的文档、历史对话、系统约束拼成一段 prompt，还要处理转义和长度截断。
3. **输出解析**。模型返回的是字符串，你要把它变成 JSON、变成 Pydantic 对象，还要处理它偶尔多说一句"好的，以下是结果："的情况。
4. **工具调用循环**。模型说"我要调用 `query_order`"，你得执行函数、把结果塞回对话、再请求一次模型、判断它还要不要继续调——这个 while 循环每写一遍都容易漏掉边界。
5. **状态与流式**。多轮会话存哪里、超长历史怎么截断、token 怎么一段段吐给前端。

这五件事单看都不难，难的是它们**在每个项目里都要重写一遍**，而且写法各不相同。LangChain 干的事，就是把这五件事固化成接口。

打个 Java 的比方：写 Servlet 也能做 Web 应用，Spring 不是必需品；但你不会想在每个项目里手写一遍参数绑定、事务、AOP。LangChain 之于 LLM 应用，大致是同一个位置——**它不是模型，不是推理引擎，也不是向量数据库**，它只负责"把这些东西组织起来"。

### 一句必须说清的话

LangChain 本身**不会让模型变聪明**。回答不准，八成是数据、切分、检索或提示词的问题，换成框架不会变好；但框架能让你更快地定位到底是哪一环出了问题——前提是你知道它的每一层在干什么。所以下面这些抽象不能只当黑盒用。

---

## 二、包结构：先搞清楚谁管什么

v1 之后 Python 端是这样一个星座（TypeScript 是另一套包名，版本号不能平移）：

| 包 | 职责 | 什么时候要装 |
| --- | --- | --- |
| `langchain-core` | 基础抽象：`Runnable`、消息类型、提示词模板、工具定义、输出解析器、`BaseChatModel`。**不含任何厂商实现** | 随 `langchain` 自动装上 |
| `langchain` | 高层入口：`create_agent`、中间件、`init_chat_model`、消息/工具类型的再导出 | 主要装这个 |
| `langchain-classic` | 0.x 时代的遗留物：`LLMChain`、`AgentExecutor`、`create_retrieval_chain`、各种老 retriever、indexing API | **只有维护老代码才装** |
| `langchain-community` | 社区维护的第三方集成，质量参差 | 按需，能不用就不用 |
| `langchain-openai` / `langchain-anthropic` / `langchain-deepseek` … | 具体厂商实现 | 用哪个装哪个 |
| `langgraph` | 有状态图编排、持久化、断点续跑、human-in-the-loop | 需要精细控制流时 |
| `langsmith` | 追踪、评估、数据集管理 | 上线前后都建议 |

这张表最值得记住的是**第三行**。网上 90% 的中文教程还是 0.x 写法，`from langchain.chains import LLMChain` 在 v1 里会直接 `ModuleNotFoundError`——不是你的环境坏了，是它被搬走了。

顺带一句：v1 要求 **Python 3.10+**（3.9 在 2025 年 10 月 EOL 了）。

---

## 三、六个核心抽象

LangChain 的 API 面很宽，但真正每天用到的就六个。理解了这六个，剩下的都是排列组合。

### 1. ChatModel：一切从一个模型实例开始

```python
from langchain_openai import ChatOpenAI

# DeepSeek 兼容 OpenAI 协议，换个 base_url 就能用
model = ChatOpenAI(
    model="deepseek-chat",
    base_url="https://api.deepseek.com",
    api_key="sk-...",
    temperature=0,
)
```

v1 里还提供了统一初始化入口，省去 import 厂商包：

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("deepseek:deepseek-chat", temperature=0)
```

一个模型实例提供四个调用方式，这是整个框架的**统一契约**：

| 方法 | 用途 |
| --- | --- |
| `invoke(input)` | 单次调用，返回结果对象 |
| `stream(input)` | 流式，逐块产出 |
| `batch(inputs)` | 批量并发，比 for 循环快一个数量级 |
| `ainvoke` / `astream` / `abatch` | 上面三个的异步版本 |

在这个契约之上还有两个能力：`bind_tools([...])` 绑定可调用工具，`with_structured_output(Schema)` 直接产出结构化对象。**这两个是所有上层玩法的地基**。

### 2. Message 与标准内容块

消息类型是 `SystemMessage` / `HumanMessage` / `AIMessage` / `ToolMessage` 四条。v1 新增的 `content_blocks` 属性值得单独说一句：

不同厂商返回的东西越来越花——推理过程（reasoning）、引用（citations）、服务端工具调用，各家字段名都不一样。`content_blocks` 把它们归一成统一的块结构，同时保留访问原始字段的口子。**它的价值在于：换模型时不用改前端和流式解析。** 这一点在真实项目里非常省事。

### 3. PromptTemplate：让提示词可版本化

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一名资深 Java 后端面试官，回答要具体、给出取舍，不要泛泛而谈。"),
    ("human", "{question}"),
])
```

字符串拼提示词的问题不是丑，是**没法做变量校验、没法复用、没法测**。模板化之后，提示词就是一个带变量的对象，能单独拿出来跑测试用例。

多轮场景用 `MessagesPlaceholder("history")` 把对话历史插进来，比手写字符串拼接可靠得多。

### 4. 输出解析：不解析就是在赌运气

最省事的是 `StrOutputParser()`，只取文本。但只要下游要的是结构化数据，就别用正则去抠：

```python
from pydantic import BaseModel, Field

class Review(BaseModel):
    score: int = Field(description="0-100 的评分")
    issues: list[str] = Field(description="发现的问题，没有就给空数组")

structured = model.with_structured_output(Review)
review = structured.invoke("评审这段代码：public void f(){...}")
```

模型会不会遵守 schema？在支持 tool calling 的模型上，`with_structured_output` 走的是工具调用或厂商原生结构化输出，比"提示它返回 JSON"再解析字符串稳定得多。**这是我最推荐新手立刻改掉的一个习惯。**

### 5. Runnable 与 LCEL

`Runnable` 是"可被调用、可被组合的工作单元"。所有上面这些东西——模板、模型、解析器、检索器、甚至纯函数——都实现同一个协议：

```python
chain = prompt | model | StrOutputParser()
chain.invoke({"question": "Spring 怎么解决循环依赖？"})
```

`|` 就是组合运算符。这个设计让"提示词 + 模型 + 解析"变成一个对象，能 `.stream()`、能 `.batch()`、能丢进异步任务里。

### 6. Tool：把函数递给模型

```python
from langchain.tools import tool

@tool
def query_order(order_id: str) -> str:
    """按订单号查询物流状态。入参必须是纯数字订单号。"""
    return "..."
```

`@tool` 会从函数签名和 **docstring** 自动生成 JSON Schema——docstring 不是给人看的注释，是**给模型看的说明书**。写得含糊，模型就会乱填参数。我见过太多人在这里写 `"""查询订单"""` 就完事，然后抱怨工具调用不稳定。

---

## 四、LCEL 到底解决了什么

LCEL（LangChain Expression Language）被讨论得最多，也最容易被神化。它实在的好处有三个：

**① 流式天然打通。** 用 `|` 串起来的链，`.stream()` 会一路透传，最后一个 token 出来前端就能渲染。手写的话，你得自己处理"prompt 拼装完成 → 模型开始吐字 → 解析器增量处理"三段状态。

**② 并发是免费的。**

```python
from langchain_core.runnables import RunnableParallel

chain = RunnableParallel(
    docs=retriever,
    question=RunnablePassthrough(),
) | answer_prompt | model | StrOutputParser()
```

检索和原问题传递同时进行，不用自己开 `asyncio.gather`。

**③ 统一契约带来的组合性。** 一个链可以当另一个链的一环，可以 `.batch()` 一百条并发跑，可以嵌进 Agent 当工具。

### 但它不是银弹

LCEL 表达的是**线性的、确定性的管道**。一旦出现这些情况，就该换工具了：

- 需要循环（"检索了但不够，要不要再检索一次"）
- 需要条件分支（"如果是闲聊就直接回，如果是业务问题才查库"）
- 需要人工介入（"金额超过 1 万先停下来等审批"）
- 需要断点续跑（跑了一半服务重启了）

前两个还能用 `RunnableBranch` 硬凑，后两个 LCEL 根本表达不了。这就是 LangGraph 存在的原因。

> 补一句现状：v1 的官方文档里几乎不再提 "LCEL" 这个词，但没有删——`RunnablePassthrough`、`RunnableLambda`、`StrOutputParser` 都还在 `langchain_core.runnables` 里，`|` 依然能用。只是官方叙事重心从"拼链"转到了"建 Agent"。看到网上说"LCEL 已死"的，多半是标题党。

---

## 五、Agent：从"你定顺序"到"模型定顺序"

Chain 和 Agent 的区别，一句话：

> **Chain 的执行顺序是你写死的，Agent 的执行顺序是模型在运行时决定的。**

在 v1 里建一个 Agent 就这么几行：

```python
from langchain.agents import create_agent

agent = create_agent(
    model=model,
    tools=[query_order, search_kb],
    system_prompt="你是客服助手。查不到的信息就直说不知道，不要编。",
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "帮我查一下订单 20261015 到哪了"}]
})
```

它底下做的事，说穿了是一个 while 循环：

```
把对话 + 工具清单发给模型
  ↓
模型要么给出最终回答 → 结束
要么要求调用某个工具（可能一次要调用多个）
  ↓
框架执行工具，把结果作为 ToolMessage 塞回对话
  ↓
继续下一轮
```

就这么朴素。所谓"智能"，来自模型在每一轮自己判断"我还缺什么信息"。所以**Agent 的可靠性上限，取决于你的工具设计**——工具描述含糊、返回值太啰嗦、错误信息不可读，Agent 就会在一个循环里反复试错，烧钱又答不对。

### 中间件：v1 最值得关注的新东西

`create_agent` 的定制能力不在参数上，而在 **middleware** 上。常用的几类：

| 场景 | 做法 |
| --- | --- |
| 提示词要随状态变化（新人 / 专家不同口吻） | `@dynamic_prompt` |
| 长对话要自动摘要，避免爆上下文 | `before_model` 里裁剪/压缩消息 |
| 工具要限权（只读工具 vs 写操作） | 在 middleware 里过滤工具列表 |
| 工具报错要让模型自己修正 | `wrap_tool_call` 捕获异常，转成可读文本返回 |
| 加护栏（敏感词、金额阈值） | 在模型调用前后拦截 |

这比 0.x 时代"往 AgentExecutor 里塞一堆 callback"清晰太多，本质上把"上下文工程"变成了可组合的中间件。

---

## 六、LangGraph：什么时候必须下沉

Agent 是"模型决定下一步"，LangGraph 是"**你决定有哪几步，模型只是其中某几步**"。

它提供三样 LCEL 和纯 Agent 都给不了的东西：

1. **显式状态**：整个流程共享一个 state 对象，每个节点读它、改它。
2. **检查点（checkpoint）**：每步自动落盘，服务重启能接着跑，支持"回放"。
3. **中断（interrupt）**：跑到某一步停下来等人审批，批完继续。

一个最小形态：

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class State(TypedDict):
    question: str
    docs: list[str]
    answer: str

def retrieve(state: State):
    return {"docs": retriever.invoke(state["question"])}

def should_retry(state: State) -> str:
    return "retrieve" if len(state["docs"]) < 2 else "generate"

def generate(state: State):
    return {"answer": llm.invoke(...)}

graph = StateGraph(State)
graph.add_node("retrieve", retrieve)
graph.add_node("generate", generate)
graph.add_edge(START, "retrieve")
graph.add_conditional_edges("retrieve", should_retry, {"retrieve": "retrieve", "generate": "generate"})
graph.add_edge("generate", END)

app = graph.compile()
```

**我的判断标准**：能用 `create_agent` 解决就别碰 LangGraph；一旦出现"必须按固定顺序走、某一步要人工确认、失败要回到上一步"这类需求，就别在 Agent 里靠提示词硬拧，直接画图。

反过来也一样：一个三节点的固定流程，用 LangGraph 写出来是杀鸡用牛刀，一条 `|` 链更清楚。

---

## 七、把上一篇的 RAG 串起来

RAG 用 LangChain 写，分成索引和查询两侧。

**索引侧（离线跑一次）**

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)
chunks = splitter.split_documents(docs)

vectorstore = Chroma.from_documents(
    chunks,
    embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
    persist_directory="./chroma",
)
```

**查询侧（在线）**

```python
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

rag_prompt = ChatPromptTemplate.from_messages([
    ("system", "只依据下面的资料回答，资料里没有就说不知道。\n\n{context}"),
    ("human", "{question}"),
])

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | rag_prompt
    | model
    | StrOutputParser()
)
```

注意这里 `{"context": retriever, ...}` 的写法：字典里放 Runnable，LCEL 会自动并发执行再合并。这是 LCEL 最实用的一个技巧。

但还是要重复上一篇的结论：**LangChain 只是帮你把管道搭好，它不会让你的检索变准。** 切分策略、embedding 选型、是否需要 rerank，这些和框架无关，做不好照样答非所问。

---

## 八、可观测：不记录就等于闭眼调优

LangChain 的 callback 机制可以拿到每一步的输入输出、耗时、token 用量、工具调用参数。最省事的接入方式是环境变量：

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY=lsv2_...
```

之后每次调用都会在 LangSmith 里生成一棵调用树，能看到"检索召回了哪 4 个 chunk、模型实际收到的完整 prompt、它为什么决定调这个工具"。

这一点在调 Agent 时尤其关键——Agent 出问题最典型的表现是"绕圈子"，而绕圈子的原因只有看每一步的输入才能定位：是工具返回太啰嗦让模型误判？还是工具描述让它以为可以重复调用？

没有追踪，你只能靠打印日志猜。

---

## 九、版本迁移：这一节建议原样收藏

LangChain 的版本演进对写代码的人不太友好，网上教程大多停留在 0.1/0.2 时代。

| 你可能见过的写法 | v1 的去向 |
| --- | --- |
| `from langchain.chains import LLMChain` | → `langchain_classic.chains` |
| `AgentExecutor` + `create_openai_tools_agent` | → `langchain.agents.create_agent` |
| `create_retrieval_chain` / `create_stuff_documents_chain` | → `langchain_classic.chains` |
| `langgraph.prebuilt.create_react_agent` | → 废弃，改用 `create_agent`（同参数，`prompt` 改名 `system_prompt`） |
| `ConversationBufferMemory` 等 memory 对象 | → 由 LangGraph 的 checkpointer 承担 |
| `MultiQueryRetriever` 等老检索器 | → `langchain_classic.retrievers` |
| `langchain_community.vectorstores.Chroma` | → `langchain_chroma` |

几条实操建议：

1. **锁版本**。`langchain>=1.0,<2.0`，别用 `latest`。这个生态迭代太快，一次 `pip install -U` 足够让整个项目跑不起来。
2. **看到 `ModuleNotFoundError` 先想"是不是被搬家了"**，而不是"我环境坏了"。
3. **不要把 0.x 的教程代码直接跑**，尤其是涉及 memory 和 retriever 的部分，几乎全要改。

---

## 十、什么时候**不该**用 LangChain

这部分很多教程不会写，但它决定了你会不会在项目里背上不必要的复杂度。

| 你的场景 | 建议 |
| --- | --- |
| 只是单轮问答、一次检索、一个模型 | **直接调 SDK**，一百行以内能写完，引入框架纯负担 |
| 需要极致控制（自定义流式协议、特殊重试、二进制协议） | 自己写，框架的抽象会挡路 |
| 检索策略极其复杂（多路召回、复杂索引结构、节点解析） | LlamaIndex 在这块更专注 |
| 只是要个严格的固定流水线，不需要模型决策 | 普通函数 + `asyncio` 就够，或者一条 LCEL |
| 需要多轮、工具调用、人工审批、长任务 | ✅ 这才是 LangChain / LangGraph 的主场 |

我的经验法则：**当你第二次开始手写"调模型 → 判断要不要调工具 → 再调模型"这个循环时**，就该上框架了。第一次手写是有必要的，你会知道框架到底替你做了什么。

---

## 十一、几个我踩过的坑

**① 流式千万别在链中间做阻塞 IO。**
在 `RunnableLambda` 里包一个同步的数据库查询，整条链的流式就退化成"等全部完成后一次性返回"。要么用 `astream` + 异步客户端，要么把 IO 挪到链外面（先查完再进链）。

**② 结构化输出要检查模型能力。**
`with_structured_output` 在支持 tool calling 的模型上稳定，在小模型或纯 completion 接口上会退化成提示词约束，失败率陡增。切换模型时要重跑一遍解析测试。

**③ 工具返回值别塞大对象。**
Agent 的工具结果会原样进入下一轮上下文。返回一整页 JSON，模型既读不完又会被干扰，token 还烧得飞快。**返回摘要 + 关键字段**就够了。

**④ 提示词里的变量必须有类型意识。**
`{question}` 传了个 `None`，模板会渲染成 `"None"`，模型一本正经地回答一个不存在的问题。这种事在线上很难察觉。

**⑤ Agent 一定要设叠加上限。**
否则模型可能在一个循环里反复调工具。设置 `recursion_limit`（LangGraph）或最大迭代次数，超了就降级成"抱歉，我没查到"。

**⑥ 成本要提前算。**
Agent 一次对话可能是 5 次模型调用 + 4 次工具调用。单测的时候觉得便宜，上量之后账单会很明显。给每类请求设 token 预算，长对话做摘要压缩。

---

## 十二、面试里常被问到的几个点

**Q1：LangChain 和直接调 OpenAI SDK 有什么区别？**
答：LangChain 提供的是**跨厂商的统一契约**（invoke/stream/batch）、可组合的 Runnable 协议、以及 Agent 运行时。业务简单时它就是多余的抽象；业务一旦涉及多模型、工具调用、多轮状态，它省的重复劳动就回来了。**关键是说清"什么时候不需要它"**，只夸好用的回答一听就是没用过。

**Q2：LCEL 的 `|` 底层是什么？**
答：`Runnable` 的 `__or__` 运算符重载，返回一个 `RunnableSequence`，按顺序调用各节点的 `invoke`。它保留了每个节点的 `stream`/`batch`/异步能力，所以整条链天然支持流式和并发。

**Q3：Chain 和 Agent 的区别？**
答：控制流归谁。Chain 的分支和顺序是开发者写死的；Agent 由模型在运行时决定调用哪些工具、调用几次，框架只负责执行循环。代价是可预测性下降、成本上升。

**Q4：为什么要 LangGraph？Agent 不够吗？**
答：Agent 是"模型驱动"的单循环，不适合表达固定流程 + 人工审批 + 断点续跑。LangGraph 把流程显式画成状态图，提供持久化和中断恢复，这是生产环境做长任务的前提。

**Q5：v1 为什么把那么多东西挪到 `langchain-classic`？**
答：主包收敛到"构建 Agent 所需的最小集合"，历史 API 保留但不再演进。这样新用户学的东西少，老项目也不至于断。代价是**文档和教程出现断层**，看到 `ImportError` 要先查是不是这个原因。

**Q6：怎么评估一个 LangChain 应用的效果？**
答：分层评。检索层看召回率/精确率；生成层看答案是否被检索内容支持（faithfulness）；Agent 层看任务成功率、平均步数、平均成本。配合 LangSmith 的数据集跑回归，别靠"感觉好像变好了"。

---

## 小结

如果只用一句话概括 LangChain 在 v1 之后的定位：

> **它是一套把"模型调用、工具执行、状态流转"抽象成统一接口的运行时，而不是一个能让模型变聪明的魔法库。**

我建议的学习路径是：

1. 先用原生 SDK 写一个带工具调用的循环，**亲手踩一遍**上下文怎么拼、工具结果怎么塞回去；
2. 再用 LangChain 重写同样的东西，你会立刻明白每一步抽象在替你做什么；
3. 等遇到"要人工审批""要断点续跑""要回滚"，再去学 LangGraph——那时候你才看得懂它为什么存在。

框架是拿来省事的，不是拿来当知识盲区的。**能随时手写替代它的那一天，才是真正会用它的那一天。**
