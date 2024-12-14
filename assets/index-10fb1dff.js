import{p as R,s as W,a as U,r as k,C as l,O as C,b as P,S as $,R as A,M as v,c as b,Q as V,J as j,i as D,d as N,A as g,x as O,e as T,E as h,W as w,f as E,g as x}from"./index-044fb5fd.js";import{h as se,V as ie,Y as ae}from"./index-044fb5fd.js";const r=R({status:"uninitialized"}),u={state:r,subscribeKey(n,e){return W(r,n,e)},subscribe(n){return U(r,()=>n(r))},_getClient(){if(!r._client)throw new Error("SIWEController client not set");return r._client},async getNonce(n){const t=await this._getClient().getNonce(n);return this.setNonce(t),t},async getSession(){try{const e=await this._getClient().getSession();return e&&(this.setSession(e),this.setStatus("success")),e||void 0}catch{return}},createMessage(n){const t=this._getClient().createMessage(n);return this.setMessage(t),t},async verifyMessage(n){return await this._getClient().verifyMessage(n)},async signIn(){return await this._getClient().signIn()},async signOut(){var e;const n=this._getClient();await n.signOut(),this.setStatus("ready"),this.setSession(void 0),(e=n.onSignOut)==null||e.call(n)},onSignIn(n){var t;const e=this._getClient();(t=e.onSignIn)==null||t.call(e,n)},onSignOut(){var e;const n=this._getClient();(e=n.onSignOut)==null||e.call(n)},async setSIWEClient(n){r._client=k(n),r.session=await this.getSession(),r.status=r.session?"success":"ready",l.setAccountProp("siweStatus",r.status,"eip155"),C.setIsSiweEnabled(n.options.enabled)},setNonce(n){r.nonce=n},setStatus(n){r.status=n,l.setAccountProp("siweStatus",r.status,"eip155")},setMessage(n){r.message=n},setSession(n){r.session=n,r.status=n?"success":"ready",l.setAccountProp("siweStatus",r.status,"eip155")}},_={FIVE_MINUTES_IN_MS:3e5};class F{constructor(e){const{enabled:t=!0,nonceRefetchIntervalMs:a=_.FIVE_MINUTES_IN_MS,sessionRefetchIntervalMs:i=_.FIVE_MINUTES_IN_MS,signOutOnAccountChange:s=!0,signOutOnDisconnect:o=!0,signOutOnNetworkChange:c=!0,...d}=e;this.options={enabled:t,nonceRefetchIntervalMs:a,sessionRefetchIntervalMs:i,signOutOnDisconnect:o,signOutOnAccountChange:s,signOutOnNetworkChange:c},this.methods=d}async getNonce(e){const t=await this.methods.getNonce(e);if(!t)throw new Error("siweControllerClient:getNonce - nonce is undefined");return t}async getMessageParams(){var e,t;return await((t=(e=this.methods).getMessageParams)==null?void 0:t.call(e))||{}}createMessage(e){const t=this.methods.createMessage(e);if(!t)throw new Error("siweControllerClient:createMessage - message is undefined");return t}async verifyMessage(e){return await this.methods.verifyMessage(e)}async getSession(){const e=await this.methods.getSession();if(!e)throw new Error("siweControllerClient:getSession - session is undefined");return e}async signIn(){var I,y;if(!u.state._client)throw new Error("SIWE client needs to be initialized before calling signIn");const e=l.state.activeCaipAddress,t=e?P.getPlainAddress(e):"",a=await this.methods.getNonce(t);if(!t)throw new Error("An address is required to create a SIWE message.");const i=l.state.activeCaipNetwork;if(!(i!=null&&i.id))throw new Error("A chainId is required to create a SIWE message.");const s=i.id;if(!s)throw new Error("A chainId is required to create a SIWE message.");const o=(I=u.state._client)==null?void 0:I.options.signOutOnNetworkChange;o&&(u.state._client.options.signOutOnNetworkChange=!1,await this.signOut()),o&&(u.state._client.options.signOutOnNetworkChange=!0);const c=await((y=this.getMessageParams)==null?void 0:y.call(this)),d=this.methods.createMessage({address:e,chainId:Number(s),nonce:a,version:"1",iat:(c==null?void 0:c.iat)||new Date().toISOString(),...c});$.getConnectedConnector()==="AUTH"&&A.pushTransactionStack({view:null,goBack:!1,replace:!0,onSuccess(){v.close()}});const M=await b.signMessage(d);if(!await this.methods.verifyMessage({message:d,signature:M}))throw new Error("Error verifying SIWE signature");const f=await this.methods.getSession();if(!f)throw new Error("Error verifying SIWE signature");return this.methods.onSignIn&&this.methods.onSignIn(f),f}async signOut(){var e,t;return(t=(e=this.methods).onSignOut)==null||t.call(e),this.methods.signOut()}}const H=/0x[a-fA-F0-9]{40}/u,z=/Chain ID: (?<temp1>\d+)/u;function J(n){var e;return((e=n.match(H))==null?void 0:e[0])||""}function Q(n){var e;return`eip155:${((e=n.match(z))==null?void 0:e[1])||1}`}async function B({address:n,message:e,signature:t,chainId:a,projectId:i}){let s=V(n,e,t);return s||(s=await j(n,e,t,a,i)),s}const K=D`
  :host {
    display: flex;
    justify-content: center;
    gap: var(--wui-spacing-2xl);
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`;var Y=globalThis&&globalThis.__decorate||function(n,e,t,a){var i=arguments.length,s=i<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,t):a,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(n,e,t,a);else for(var c=n.length-1;c>=0;c--)(o=n[c])&&(s=(i<3?o(s):i>3?o(e,t,s):o(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};let S=class extends N{constructor(){var e,t;super(...arguments),this.dappImageUrl=(e=C.state.metadata)==null?void 0:e.icons,this.walletImageUrl=(t=g.state.connectedWalletInfo)==null?void 0:t.icon}firstUpdated(){var t;const e=(t=this.shadowRoot)==null?void 0:t.querySelectorAll("wui-visual-thumbnail");e!=null&&e[0]&&this.createAnimation(e[0],"translate(18px)"),e!=null&&e[1]&&this.createAnimation(e[1],"translate(-18px)")}render(){var e;return O`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${(e=this.dappImageUrl)==null?void 0:e[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,t){e.animate([{transform:"translateX(0px)"},{transform:t}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};S.styles=K;S=Y([T("w3m-connecting-siwe")],S);var m=globalThis&&globalThis.__decorate||function(n,e,t,a){var i=arguments.length,s=i<3?e:a===null?a=Object.getOwnPropertyDescriptor(e,t):a,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(n,e,t,a);else for(var c=n.length-1;c>=0;c--)(o=n[c])&&(s=(i<3?o(s):i>3?o(e,t,s):o(e,t))||s);return i>3&&s&&Object.defineProperty(e,t,s),s};let p=class extends N{constructor(){var e;super(...arguments),this.dappName=(e=C.state.metadata)==null?void 0:e.name,this.isSigning=!1,this.isCancelling=!1}render(){return O`
      <wui-flex justifyContent="center" .padding=${["2xl","0","xxl","0"]}>
        <w3m-connecting-siwe></w3m-connecting-siwe>
      </wui-flex>
      <wui-flex
        .padding=${["0","4xl","l","4xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100"
          >${this.dappName??"Dapp"} needs to connect to your wallet</wui-text
        >
      </wui-flex>
      <wui-flex
        .padding=${["0","3xl","l","3xl"]}
        gap="s"
        justifyContent="space-between"
      >
        <wui-text variant="small-400" align="center" color="fg-200"
          >Sign this message to prove you own this wallet and proceed. Canceling will disconnect
          you.</wui-text
        >
      </wui-flex>
      <wui-flex .padding=${["l","xl","xl","xl"]} gap="s" justifyContent="space-between">
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="neutral"
          ?loading=${this.isCancelling}
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="lg"
          borderRadius="xs"
          fullWidth
          variant="main"
          @click=${this.onSign.bind(this)}
          ?loading=${this.isSigning}
          data-testid="w3m-connecting-siwe-sign"
        >
          ${this.isSigning?"Signing...":"Sign"}
        </wui-button>
      </wui-flex>
    `}async onSign(){var e,t,a;this.isSigning=!0,h.sendEvent({event:"CLICK_SIGN_SIWE_MESSAGE",type:"track",properties:{network:((e=l.state.activeCaipNetwork)==null?void 0:e.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}});try{u.setStatus("loading");const i=await u.signIn();return u.setStatus("success"),h.sendEvent({event:"SIWE_AUTH_SUCCESS",type:"track",properties:{network:((t=l.state.activeCaipNetwork)==null?void 0:t.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}}),i}catch{const o=g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT;return o?E.showError("This application might not support Smart Accounts"):E.showError("Signature declined"),u.setStatus("error"),h.sendEvent({event:"SIWE_AUTH_ERROR",type:"track",properties:{network:((a=l.state.activeCaipNetwork)==null?void 0:a.caipNetworkId)||"",isSmartAccount:o}})}finally{this.isSigning=!1}}async onCancel(){var t;this.isCancelling=!0,l.state.activeCaipAddress?(await b.disconnect(),v.close()):A.push("Connect"),this.isCancelling=!1,h.sendEvent({event:"CLICK_CANCEL_SIWE",type:"track",properties:{network:((t=l.state.activeCaipNetwork)==null?void 0:t.caipNetworkId)||"",isSmartAccount:g.state.preferredAccountType===w.ACCOUNT_TYPES.SMART_ACCOUNT}})}};m([x()],p.prototype,"isSigning",void 0);m([x()],p.prototype,"isCancelling",void 0);p=m([T("w3m-connecting-siwe-view")],p);function ee(n){return new F(n)}export{u as SIWEController,S as W3mConnectingSiwe,p as W3mConnectingSiweView,ee as createSIWEConfig,se as formatMessage,J as getAddressFromMessage,Q as getChainIdFromMessage,ie as getDidAddress,ae as getDidChainId,B as verifySignature};
