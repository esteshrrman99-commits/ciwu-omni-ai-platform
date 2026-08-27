(() => {
  'use strict';

  let conversationId =
    localStorage.getItem(
      'ciwu_m3_conversation'
    );

  async function ensureConversation() {
    if (conversationId) {
      return conversationId;
    }

    const r =
      await fetch(
        '/api/m3/conversation',
        { method: 'POST' }
      );

    const d=await r.json();

    if (!r.ok) {
      throw new Error(
        d.error || 'conversation failure'
      );
    }

    conversationId=d.conversation_id;

    localStorage.setItem(
      'ciwu_m3_conversation',
      conversationId
    );

    return conversationId;
  }

  function createUI() {
    if (
      document.getElementById(
        'ciwu-m3-frontier'
      )
    ) return;

    const root=document.createElement('section');
    root.id='ciwu-m3-frontier';

    root.innerHTML=`
      <style>
        #ciwu-m3-frontier{
          margin:20px auto;
          max-width:1100px;
          padding:20px;
          border:1px solid #273252;
          border-radius:24px;
          background:#07101f;
          color:#eaf1ff;
          font-family:system-ui,sans-serif
        }
        #ciwu-m3-frontier h2{
          margin:0 0 4px
        }
        .m3-sub{
          opacity:.7;
          margin-bottom:14px
        }
        #m3-output{
          min-height:260px;
          max-height:620px;
          overflow:auto;
          white-space:pre-wrap;
          background:#020817;
          border:1px solid #1e2947;
          border-radius:16px;
          padding:16px;
          margin-bottom:12px
        }
        #m3-input{
          width:100%;
          box-sizing:border-box;
          min-height:130px;
          border-radius:14px;
          padding:14px;
          background:#050c19;
          color:#fff;
          border:1px solid #30405f
        }
        .m3-controls{
          display:flex;
          flex-wrap:wrap;
          gap:8px;
          margin-top:10px
        }
        .m3-controls button,
        .m3-controls select{
          padding:11px 16px;
          border-radius:12px;
          border:1px solid #30405f
        }
        #m3-send{
          font-weight:800
        }
      </style>

      <h2>M3 CODING ENGINE</h2>
      <div class="m3-sub">
        OpenAI Responses • EONS Engineering Layer
      </div>

      <div id="m3-output">
M3 ready.
      </div>

      <textarea
        id="m3-input"
        placeholder="Ask M3 to code, debug, refactor, architect, test, or explain..."
      ></textarea>

      <div class="m3-controls">
        <select id="m3-mode">
          <option>CODE</option>
          <option>CHAT</option>
          <option>DEBUG</option>
          <option>REFACTOR</option>
          <option>ARCHITECT</option>
          <option>EXPLAIN</option>
          <option>TEST</option>
          <option>SECURITY_REVIEW</option>
        </select>

        <label>
          <input
            id="m3-web"
            type="checkbox"
          >
          Web search
        </label>

        <button id="m3-send">
          SEND TO M3
        </button>

        <button id="m3-new">
          NEW CONVERSATION
        </button>
      </div>
    `;

    const old=
      [...document.querySelectorAll('*')]
        .find(el =>
          /M3 CODING ENGINE/i.test(
            el.textContent || ''
          )
        );

    if (
      old &&
      old !== document.body &&
      old.parentNode
    ) {
      old.parentNode.insertBefore(
        root,
        old.nextSibling
      );
    } else {
      document.body.appendChild(root);
    }

    const output=
      root.querySelector('#m3-output');

    const input=
      root.querySelector('#m3-input');

    root.querySelector('#m3-send')
      .addEventListener(
        'click',
        async () => {
          const message=input.value.trim();
          if (!message) return;

          output.textContent +=
            `\n\nYOU:\n${message}\n\nM3:\nThinking...`;

          input.value='';

          try {
            const id=
              await ensureConversation();

            const r=
              await fetch('/api/m3/chat',{
                method:'POST',
                headers:{
                  'Content-Type':
                    'application/json'
                },
                body:JSON.stringify({
                  message,
                  conversation_id:id,
                  mode:
                    root.querySelector(
                      '#m3-mode'
                    ).value,
                  web_search:
                    root.querySelector(
                      '#m3-web'
                    ).checked
                })
              });

            const d=await r.json();

            output.textContent =
              output.textContent.replace(
                /M3:\nThinking\.\.\.$/,
                'M3:\n' +
                (
                  d.text ||
                  d.detail ||
                  d.error ||
                  'No response'
                )
              );

            output.scrollTop=
              output.scrollHeight;

          } catch(err) {
            output.textContent +=
              '\nERROR: ' +
              err.message;
          }
        }
      );

    root.querySelector('#m3-new')
      .addEventListener(
        'click',
        () => {
          localStorage.removeItem(
            'ciwu_m3_conversation'
          );

          conversationId=null;

          output.textContent=
            'New M3 conversation ready.';
        }
      );
  }

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      createUI
    );
  } else {
    createUI();
  }
})();
