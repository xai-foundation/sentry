import{C as l,o as M,O as C,p as T,q as R,t as W,c as U,u as k,R as E,M as _,v as A,Q as P,J as $,i as V,s as v,a as g,x as N,e as O,E as w,W as h,S as I,r as b,V as L,Y as G}from"./index-DaT_h-Y0.js";import{w as se}from"./index-DaT_h-Y0.js";const a=W({status:"uninitialized"}),u={state:a,subscribeKey(t,e){return R(a,t,e)},subscribe(t){return T(a,()=>t(a))},_getClient(){if(!a._client)throw new Error("SIWEController client not set");return a._client},async getNonce(t){const n=await this._getClient().getNonce(t);return this.setNonce(n),n},async getSession(){try{const e=await this._getClient().getSession();return e&&(this.setSession(e),this.setStatus("success")),e||void 0}catch{return}},createMessage(t){const n=this._getClient().createMessage(t);return this.setMessage(n),n},async verifyMessage(t){return await this._getClient().verifyMessage(t)},async signIn(){return await this._getClient().signIn()},async signOut(){const t=this._getClient();await t.signOut(),this.setStatus("ready"),this.setSession(void 0),t.onSignOut?.()},onSignIn(t){this._getClient().onSignIn?.(t)},onSignOut(){this._getClient().onSignOut?.()},async setSIWEClient(t){a._client=M(t),a.session=await this.getSession(),a.status=a.session?"success":"ready",l.setAccountProp("siweStatus",a.status,"eip155"),C.setIsSiweEnabled(t.options.enabled)},setNonce(t){a.nonce=t},setStatus(t){a.status=t,l.setAccountProp("siweStatus",a.status,"eip155")},setMessage(t){a.message=t},setSession(t){a.session=t,a.status=t?"success":"ready",l.setAccountProp("siweStatus",a.status,"eip155")}},y={FIVE_MINUTES_IN_MS:3e5};class j{constructor(e){const{enabled:n=!0,nonceRefetchIntervalMs:i=y.FIVE_MINUTES_IN_MS,sessionRefetchIntervalMs:r=y.FIVE_MINUTES_IN_MS,signOutOnAccountChange:s=!0,signOutOnDisconnect:o=!0,signOutOnNetworkChange:c=!0,...d}=e;this.options={enabled:n,nonceRefetchIntervalMs:i,sessionRefetchIntervalMs:r,signOutOnDisconnect:o,signOutOnAccountChange:s,signOutOnNetworkChange:c},this.methods=d}async getNonce(e){const n=await this.methods.getNonce(e);if(!n)throw new Error("siweControllerClient:getNonce - nonce is undefined");return n}async getMessageParams(){return await this.methods.getMessageParams?.()||{}}createMessage(e){const n=this.methods.createMessage(e);if(!n)throw new Error("siweControllerClient:createMessage - message is undefined");return n}async verifyMessage(e){return await this.methods.verifyMessage(e)}async getSession(){const e=await this.methods.getSession();if(!e)throw new Error("siweControllerClient:getSession - session is undefined");return e}async signIn(){if(!u.state._client)throw new Error("SIWE client needs to be initialized before calling signIn");const e=l.state.activeCaipAddress,n=e?U.getPlainAddress(e):"",i=await this.methods.getNonce(n);if(!n)throw new Error("An address is required to create a SIWE message.");const r=l.state.activeCaipNetwork;if(!r?.id)throw new Error("A chainId is required to create a SIWE message.");const s=r.id;if(!s)throw new Error("A chainId is required to create a SIWE message.");const o=u.state._client?.options.signOutOnNetworkChange;o&&(u.state._client.options.signOutOnNetworkChange=!1,await this.signOut()),o&&(u.state._client.options.signOutOnNetworkChange=!0);const c=await this.getMessageParams?.(),d=this.methods.createMessage({address:e,chainId:Number(s),nonce:i,version:"1",iat:c?.iat||new Date().toISOString(),...c});k.getConnectedConnector()==="AUTH"&&E.pushTransactionStack({view:null,goBack:!1,replace:!0,onSuccess(){_.close()}});const x=await A.signMessage(d);if(!await this.methods.verifyMessage({message:d,signature:x}))throw new Error("Error verifying SIWE signature");const f=await this.methods.getSession();if(!f)throw new Error("Error verifying SIWE signature");return this.methods.onSignIn&&this.methods.onSignIn(f),f}async signOut(){return this.methods.onSignOut?.(),this.methods.signOut()}}const D=/0x[a-fA-F0-9]{40}/u,F=/Chain ID: (?<temp1>\d+)/u;function J(t){return t.match(D)?.[0]||""}function Q(t){return`eip155:${t.match(F)?.[1]||1}`}async function B({address:t,message:e,signature:n,chainId:i,projectId:r}){let s=P(t,e,n);return s||(s=await $(t,e,n,i,r)),s}const H=V`
  :host {
    display: flex;
    justify-content: center;
    gap: var(--wui-spacing-2xl);
  }

  wui-visual-thumbnail:nth-child(1) {
    z-index: 1;
  }
`;var z=function(t,e,n,i){var r=arguments.length,s=r<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(t,e,n,i);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(s=(r<3?o(s):r>3?o(e,n,s):o(e,n))||s);return r>3&&s&&Object.defineProperty(e,n,s),s};let S=class extends v{constructor(){super(...arguments),this.dappImageUrl=C.state.metadata?.icons,this.walletImageUrl=g.state.connectedWalletInfo?.icon}firstUpdated(){const e=this.shadowRoot?.querySelectorAll("wui-visual-thumbnail");e?.[0]&&this.createAnimation(e[0],"translate(18px)"),e?.[1]&&this.createAnimation(e[1],"translate(-18px)")}render(){return N`
      <wui-visual-thumbnail
        ?borderRadiusFull=${!0}
        .imageSrc=${this.dappImageUrl?.[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `}createAnimation(e,n){e.animate([{transform:"translateX(0px)"},{transform:n}],{duration:1600,easing:"cubic-bezier(0.56, 0, 0.48, 1)",direction:"alternate",iterations:1/0})}};S.styles=H;S=z([O("w3m-connecting-siwe")],S);var m=function(t,e,n,i){var r=arguments.length,s=r<3?e:i===null?i=Object.getOwnPropertyDescriptor(e,n):i,o;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")s=Reflect.decorate(t,e,n,i);else for(var c=t.length-1;c>=0;c--)(o=t[c])&&(s=(r<3?o(s):r>3?o(e,n,s):o(e,n))||s);return r>3&&s&&Object.defineProperty(e,n,s),s};let p=class extends v{constructor(){super(...arguments),this.dappName=C.state.metadata?.name,this.isSigning=!1,this.isCancelling=!1}render(){return N`
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
    `}async onSign(){this.isSigning=!0,w.sendEvent({event:"CLICK_SIGN_SIWE_MESSAGE",type:"track",properties:{network:l.state.activeCaipNetwork?.caipNetworkId||"",isSmartAccount:g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT}});try{u.setStatus("loading");const e=await u.signIn();return u.setStatus("success"),w.sendEvent({event:"SIWE_AUTH_SUCCESS",type:"track",properties:{network:l.state.activeCaipNetwork?.caipNetworkId||"",isSmartAccount:g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT}}),e}catch{const i=g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT;return i?I.showError("This application might not support Smart Accounts"):I.showError("Signature declined"),u.setStatus("error"),w.sendEvent({event:"SIWE_AUTH_ERROR",type:"track",properties:{network:l.state.activeCaipNetwork?.caipNetworkId||"",isSmartAccount:i}})}finally{this.isSigning=!1}}async onCancel(){this.isCancelling=!0,l.state.activeCaipAddress?(await A.disconnect(),_.close()):E.push("Connect"),this.isCancelling=!1,w.sendEvent({event:"CLICK_CANCEL_SIWE",type:"track",properties:{network:l.state.activeCaipNetwork?.caipNetworkId||"",isSmartAccount:g.state.preferredAccountType===h.ACCOUNT_TYPES.SMART_ACCOUNT}})}};m([b()],p.prototype,"isSigning",void 0);m([b()],p.prototype,"isCancelling",void 0);p=m([O("w3m-connecting-siwe-view")],p);function ee(t){return new j(t)}export{u as SIWEController,S as W3mConnectingSiwe,p as W3mConnectingSiweView,ee as createSIWEConfig,se as formatMessage,J as getAddressFromMessage,Q as getChainIdFromMessage,L as getDidAddress,G as getDidChainId,B as verifySignature};
