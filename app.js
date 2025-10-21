async function callOpenAI({ apiKey, model, messages }) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API 错误：${res.status} ${err}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "(无内容)";
  return text;
}

function buildPrompt({ dest, days, budget, prefs, notes }) {
  return `你是一个专业旅行规划师。根据以下需求生成详细行程（Markdown）：
- 目的地/城市：${dest}
- 出行天数：${days} 天
- 人均预算：${budget || "未指定"}
- 偏好：${prefs || "未指定"}
- 额外要求：${notes || "无"}

要求：
1) 给出【概览】（每日关键词与预算分配）
2) 按【Day 1 .. Day N】逐日列出：早/午/晚安排、交通与步行距离估算、门票/预约提醒、用餐建议（店名/均价）、备用方案（天气/人多时）
3) 标注每日大致花费与总预算控制
4) 贴心提醒：当地交通卡/网约车/防坑/小费/插头/语言等
5) 用 Markdown 输出，使用二级/三级标题和列表，易读且可直接复制`;
}

function $(id){ return document.getElementById(id); }

async function generate(planState) {
  const status = $("status");
  const result = $("result");
  const apiKey = $("apiKey").value.trim();
  const model = $("model").value.trim() || "gpt-4o-mini";

  if (!apiKey) { status.textContent = "请先填写 OpenAI API Key"; return; }

  const { dest, days, budget, prefs, notes } = planState;
  if (!dest || !days) { status.textContent = "请填写目的地和天数"; return; }

  $("genBtn").disabled = true;
  $("regenBtn").disabled = true;
  $("copyBtn").disabled = true;
  $("dlBtn").disabled = true;
  status.textContent = "正在生成行程…";

  const system = { role: "system", content: "你是专业旅行规划师，会用清晰的 Markdown 生成行程。" };
  const user = { role: "user", content: buildPrompt({ dest, days, budget, prefs, notes }) };

  try {
    const text = await callOpenAI({ apiKey, model, messages: [system, user] });
    result.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
    status.textContent = "生成完成 ✅";
    $("regenBtn").disabled = false;
    $("copyBtn").disabled = false;
    $("dlBtn").disabled = false;
  } catch (e) {
    console.error(e);
    status.textContent = e.message;
  } finally {
    $("genBtn").disabled = false;
  }
}

function escapeHtml(s){
  return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

function download(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

window.addEventListener("DOMContentLoaded", () => {
  const state = () => ({
    dest: $("dest").value.trim(),
    days: Number($("days").value || 0),
    budget: $("budget").value.trim(),
    prefs: $("prefs").value.trim(),
    notes: $("notes").value.trim()
  });

  $("genBtn").addEventListener("click", () => generate(state()));
  $("regenBtn").addEventListener("click", () => generate(state()));

  $("copyBtn").addEventListener("click", () => {
    const txt = $("result").innerText || "";
    navigator.clipboard.writeText(txt).then(() => {
      $("status").textContent = "已复制到剪贴板";
    });
  });

  $("dlBtn").addEventListener("click", () => {
    const txt = $("result").innerText || "";
    const d = new Date();
    const name = `GoTravel_${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}.md`;
    download(name, txt);
  });
});
