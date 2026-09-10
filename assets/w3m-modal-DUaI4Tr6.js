const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Bvq4fG4b.js","assets/index-DdDUKouu.js","assets/index-Br0KjMVh.css"])))=>i.map(i=>d[i]);
import{i as y,s as C,M as a,C as h,O as f,A as k,a as p,E as S,x as E,R as l,_ as m,T as x,U as A,b as _,S as N,c as b,d as O,r as w,e as L}from"./index-DdDUKouu.js";const I=y`
  :host {
    z-index: var(--w3m-z-index);
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: var(--wui-cover);
    transition: opacity 0.2s var(--wui-ease-out-power-2);
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
  }

  wui-card {
    max-width: var(--w3m-modal-width);
    width: 100%;
    position: relative;
    animation: zoom-in 0.2s var(--wui-ease-out-power-2);
    animation-fill-mode: backwards;
    outline: none;
  }

  wui-card[shake='true'] {
    animation:
      zoom-in 0.2s var(--wui-ease-out-power-2),
      w3m-shake 0.5s var(--wui-ease-out-power-2);
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--wui-spacing-xxl) 0px;
    }
  }

  @media (max-width: 430px) {
    wui-flex {
      align-items: flex-end;
    }

    wui-card {
      max-width: 100%;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: none;
      animation: slide-in 0.2s var(--wui-ease-out-power-2);
    }

    wui-card[shake='true'] {
      animation:
        slide-in 0.2s var(--wui-ease-out-power-2),
        w3m-shake 0.5s var(--wui-ease-out-power-2);
    }
  }

  @keyframes zoom-in {
    0% {
      transform: scale(0.95) translateY(0);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes slide-in {
    0% {
      transform: scale(1) translateY(50px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes w3m-view-height {
    from {
      height: var(--prev-height);
    }
    to {
      height: var(--new-height);
    }
  }
`;var c=function(u,e,t,i){var o=arguments.length,s=o<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,t):i,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(u,e,t,i);else for(var d=u.length-1;d>=0;d--)(n=u[d])&&(s=(o<3?n(s):o>3?n(e,t,s):n(e,t))||s);return o>3&&s&&Object.defineProperty(e,t,s),s};const v="scroll-lock";let r=class extends C{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.open=a.state.open,this.caipAddress=h.state.activeCaipAddress,this.caipNetwork=h.state.activeCaipNetwork,this.isSiweEnabled=f.state.isSiweEnabled,this.shake=a.state.shake,this.initializeTheming(),k.prefetch(),this.unsubscribe.push(a.subscribeKey("open",e=>e?this.onOpen():this.onClose()),a.subscribeKey("shake",e=>this.shake=e),p.subscribeKey("siweStatus",e=>this.onSiweStatusChange(e),"eip155"),h.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),h.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e)),f.subscribeKey("isSiweEnabled",e=>this.isSiweEnabled=e)),S.sendEvent({type:"track",event:"MODAL_LOADED"})}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.open?E`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            <wui-card
              shake="${this.shake}"
              role="alertdialog"
              aria-modal="true"
              tabindex="0"
              data-testid="w3m-modal-card"
            >
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
              <w3m-snackbar></w3m-snackbar>
              <w3m-alertbar></w3m-alertbar>
            </wui-card>
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}async onOverlayClick(e){e.target===e.currentTarget&&await this.handleClose()}async handleClose(){const e=l.state.view==="ConnectingSiwe",t=l.state.view==="ApproveTransaction";if(this.isSiweEnabled){const{SIWEController:i}=await m(async()=>{const{SIWEController:s}=await import("./index-Bvq4fG4b.js");return{SIWEController:s}},__vite__mapDeps([0,1,2]));i.state.status!=="success"&&(e||t)?a.shake():a.close()}else a.close()}initializeTheming(){const{themeVariables:e,themeMode:t}=x.state,i=A.getColorTheme(t);_(e,i)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),N.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement("style");e.dataset.w3m=v,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${v}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;const e=this.shadowRoot?.querySelector("wui-card");e?.focus(),window.addEventListener("keydown",t=>{if(t.key==="Escape")this.handleClose();else if(t.key==="Tab"){const{tagName:i}=t.target;i&&!i.includes("W3M-")&&!i.includes("WUI-")&&e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}onSiweStatusChange(e){e==="success"&&a.close()}async onNewAddress(e){const t=this.caipAddress,i=t?b.getPlainAddress(t):void 0,o=e?b.getPlainAddress(e):void 0,s=i===o;if(this.caipAddress=e,o&&!s&&this.isSiweEnabled)try{const{SIWEController:n}=await m(async()=>{const{SIWEController:g}=await import("./index-Bvq4fG4b.js");return{SIWEController:g}},__vite__mapDeps([0,1,2])),d=p.state.siweStatus==="success";!i&&o?this.onSiweNavigation():d&&i&&o&&i!==o&&n.state._client?.options.signOutOnAccountChange&&(await n.signOut(),this.onSiweNavigation())}catch(n){throw this.caipAddress=t,n}o||a.close()}async onNewNetwork(e){if(!this.caipAddress){this.caipNetwork=e,l.goBack();return}const t=this.caipNetwork?.caipNetworkId?.toString(),i=e?.caipNetworkId?.toString();if(t&&i&&t!==i)if(this.isSiweEnabled){const{SIWEController:o}=await m(async()=>{const{SIWEController:s}=await import("./index-Bvq4fG4b.js");return{SIWEController:s}},__vite__mapDeps([0,1,2]));o.state._client?.options.signOutOnNetworkChange?(await o.signOut(),this.onSiweNavigation()):l.goBack()}else l.goBack();this.caipNetwork=e}onSiweNavigation(){const e=h.state.activeChain===O.CHAIN.EVM;!(p.state.siweStatus==="success")&&e?this.open?l.replace("ConnectingSiwe"):a.open({view:"ConnectingSiwe"}):l.goBack()}};r.styles=I;c([w()],r.prototype,"open",void 0);c([w()],r.prototype,"caipAddress",void 0);c([w()],r.prototype,"caipNetwork",void 0);c([w()],r.prototype,"isSiweEnabled",void 0);c([w()],r.prototype,"shake",void 0);r=c([L("w3m-modal")],r);export{r as W3mModal};
