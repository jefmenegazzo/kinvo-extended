import{b as Qe,f as Ke,i as Je,k as Xe,m as Ye,n as et}from"./chunk-G3GURM7Z.js";import{a as le,b as tt,c as Ie,d as it,e as nt,f as at,h as rt,i as ot,j as st,k as lt,l as ct,m as pt,n as ce,o as pe,q as dt,s as ut,t as de,u as ue,v as mt}from"./chunk-DMPKU74Y.js";import{A as xe,D as $e,i as ve,j as Ze,k as ne,p as qe,q as ae,r as re,s as oe,t as O,u as A,v as Ge,w as se,z as ke}from"./chunk-GAGUUXVT.js";import{c as We,d as Ce,f as ye,h as we}from"./chunk-4YRY4IP2.js";import{$a as g,Aa as Re,Ab as C,Bb as v,Ca as S,Cb as p,Fa as De,Fb as q,Gb as G,Gc as Y,Hb as E,Ib as L,Ic as ee,Ja as Oe,Jb as P,Kb as x,Lb as Be,Mb as W,Mc as te,Nc as ie,Q as Ve,Rb as $,Rc as M,Sb as V,Tc as be,Ub as ge,Vb as je,Wb as _e,Xb as He,_a as r,ac as R,ba as B,bc as D,ca as Me,cc as Ne,d as F,da as j,eb as Ae,ha as Fe,ib as Q,jb as K,ma as w,mb as u,na as H,nc as J,ob as d,pa as Pe,pb as o,qc as y,rb as ze,rc as X,tb as k,ub as l,va as m,vb as c,wa as h,wb as b,xa as N,xb as I,ya as U,yb as T,zb as Z,zc as Ue}from"./chunk-BXU37XCI.js";var Ct=["input"],yt=(i,a,e,n)=>({"p-checkbox p-component":!0,"p-checkbox-checked":i,"p-checkbox-disabled":a,"p-checkbox-focused":e,"p-variant-filled":n}),wt=(i,a,e)=>({"p-highlight":i,"p-disabled":a,"p-focus":e}),kt=(i,a,e)=>({"p-checkbox-label":!0,"p-checkbox-label-active":i,"p-disabled":a,"p-checkbox-label-focus":e});function xt(i,a){if(i&1&&b(0,"span",10),i&2){let e=p(3);o("ngClass",e.checkboxIcon),d("data-pc-section","icon")}}function It(i,a){i&1&&b(0,"CheckIcon",11),i&2&&(o("styleClass","p-checkbox-icon"),d("data-pc-section","icon"))}function Tt(i,a){if(i&1&&(I(0),u(1,xt,1,2,"span",8)(2,It,1,2,"CheckIcon",9),T()),i&2){let e=p(2);r(),o("ngIf",e.checkboxIcon),r(),o("ngIf",!e.checkboxIcon)}}function St(i,a){}function Et(i,a){i&1&&u(0,St,0,0,"ng-template")}function Lt(i,a){if(i&1&&(l(0,"span",12),u(1,Et,1,0,null,13),c()),i&2){let e=p(2);d("data-pc-section","icon"),r(),o("ngTemplateOutlet",e.checkboxIconTemplate)}}function Vt(i,a){if(i&1&&(I(0),u(1,Tt,3,2,"ng-container",5)(2,Lt,2,2,"span",7),T()),i&2){let e=p();r(),o("ngIf",!e.checkboxIconTemplate),r(),o("ngIf",e.checkboxIconTemplate)}}function Mt(i,a){if(i&1){let e=C();l(0,"label",14),v("click",function(t){m(e);let s=p(),f=P(3);return h(s.onClick(t,f,!0))}),x(1),c()}if(i&2){let e=p();k(e.labelStyleClass),o("ngClass",_e(6,kt,e.checked(),e.disabled,e.focused)),d("for",e.inputId)("data-pc-section","label"),r(),W(" ",e.label,"")}}var Ft={provide:le,useExisting:B(()=>Te),multi:!0},Te=(()=>{class i{cd;injector;config;value;name;disabled;binary;label;ariaLabelledBy;ariaLabel;tabindex;inputId;style;styleClass;labelStyleClass;formControl;checkboxIcon;readonly;required;autofocus;trueValue=!0;falseValue=!1;variant="outlined";onChange=new S;onFocus=new S;onBlur=new S;inputViewChild;templates;checkboxIconTemplate;model;onModelChange=()=>{};onModelTouched=()=>{};focused=!1;constructor(e,n,t){this.cd=e,this.injector=n,this.config=t}ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"icon":this.checkboxIconTemplate=e.template;break}})}onClick(e,n,t){e.preventDefault(),!(this.disabled||this.readonly)&&(this.updateModel(e),t&&n.focus())}updateModel(e){let n,t=this.injector.get(it,null,{optional:!0,self:!0}),s=t&&!this.formControl?t.value:this.model;this.binary?(n=this.checked()?this.falseValue:this.trueValue,this.model=n,this.onModelChange(n)):(this.checked()?n=s.filter(f=>!ve.equals(f,this.value)):n=s?[...s,this.value]:[this.value],this.onModelChange(n),this.model=n,this.formControl&&this.formControl.setValue(n)),this.onChange.emit({checked:n,originalEvent:e})}handleChange(e){this.readonly||this.updateModel(e)}onInputFocus(e){this.focused=!0,this.onFocus.emit(e)}onInputBlur(e){this.focused=!1,this.onBlur.emit(e),this.onModelTouched()}focus(){this.inputViewChild.nativeElement.focus()}writeValue(e){this.model=e,this.cd.markForCheck()}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){setTimeout(()=>{this.disabled=e,this.cd.markForCheck()})}checked(){return this.binary?this.model===this.trueValue:ve.contains(this.value,this.model)}static \u0275fac=function(n){return new(n||i)(g(J),g(Re),g(ae))};static \u0275cmp=w({type:i,selectors:[["p-checkbox"]],contentQueries:function(n,t,s){if(n&1&&q(s,re,4),n&2){let f;E(f=L())&&(t.templates=f)}},viewQuery:function(n,t){if(n&1&&G(Ct,5),n&2){let s;E(s=L())&&(t.inputViewChild=s.first)}},hostAttrs:[1,"p-element"],inputs:{value:"value",name:"name",disabled:[2,"disabled","disabled",y],binary:[2,"binary","binary",y],label:"label",ariaLabelledBy:"ariaLabelledBy",ariaLabel:"ariaLabel",tabindex:[2,"tabindex","tabindex",X],inputId:"inputId",style:"style",styleClass:"styleClass",labelStyleClass:"labelStyleClass",formControl:"formControl",checkboxIcon:"checkboxIcon",readonly:[2,"readonly","readonly",y],required:[2,"required","required",y],autofocus:[2,"autofocus","autofocus",y],trueValue:"trueValue",falseValue:"falseValue",variant:"variant"},outputs:{onChange:"onChange",onFocus:"onFocus",onBlur:"onBlur"},features:[$([Ft]),K],decls:7,vars:37,consts:[["input",""],[3,"ngStyle","ngClass"],[1,"p-hidden-accessible"],["type","checkbox","pAutoFocus","",3,"change","focus","blur","value","checked","disabled","readonly","autofocus"],[1,"p-checkbox-box",3,"click","ngClass"],[4,"ngIf"],[3,"class","ngClass","click",4,"ngIf"],["class","p-checkbox-icon",4,"ngIf"],["class","p-checkbox-icon",3,"ngClass",4,"ngIf"],[3,"styleClass",4,"ngIf"],[1,"p-checkbox-icon",3,"ngClass"],[3,"styleClass"],[1,"p-checkbox-icon"],[4,"ngTemplateOutlet"],[3,"click","ngClass"]],template:function(n,t){if(n&1){let s=C();l(0,"div",1)(1,"div",2)(2,"input",3,0),v("change",function(_){return m(s),h(t.handleChange(_))})("focus",function(_){return m(s),h(t.onInputFocus(_))})("blur",function(_){return m(s),h(t.onInputBlur(_))}),c()(),l(4,"div",4),v("click",function(_){m(s);let fe=P(3);return h(t.onClick(_,fe,!0))}),u(5,Vt,3,2,"ng-container",5),c()(),u(6,Mt,2,10,"label",6)}n&2&&(k(t.styleClass),o("ngStyle",t.style)("ngClass",He(28,yt,t.checked(),t.disabled,t.focused,t.variant==="filled"||t.config.inputStyle()==="filled")),d("data-pc-name","checkbox")("data-pc-section","root"),r(),d("data-pc-section","hiddenInputWrapper")("data-p-hidden-accessible",!0),r(),o("value",t.value)("checked",t.checked())("disabled",t.disabled)("readonly",t.readonly)("autofocus",t.autofocus),d("id",t.inputId)("name",t.name)("tabindex",t.tabindex)("required",t.required)("aria-labelledby",t.ariaLabelledBy)("aria-label",t.ariaLabel)("aria-checked",t.checked())("data-pc-section","hiddenInput"),r(2),o("ngClass",_e(33,wt,t.checked(),t.disabled,t.focused)),d("data-p-highlight",t.checked())("data-p-disabled",t.disabled)("data-p-focused",t.focused)("data-pc-section","input"),r(),o("ngIf",t.checked()),r(),o("ngIf",t.label))},dependencies:()=>[Y,ee,ie,te,ce,ke],styles:[`@layer primeng{.p-checkbox{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-checkbox-disabled{cursor:default!important;pointer-events:none}.p-checkbox-box{display:flex;justify-content:center;align-items:center}p-checkbox{display:inline-flex;vertical-align:bottom;align-items:center}.p-checkbox-label{line-height:1}}
`],encapsulation:2,changeDetection:0})}return i})(),ht=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=H({type:i});static \u0275inj=j({imports:[M,pe,ke,oe]})}return i})();var Se=(()=>{class i extends se{static \u0275fac=(()=>{let e;return function(t){return(e||(e=U(i)))(t||i)}})();static \u0275cmp=w({type:i,selectors:[["EyeIcon"]],standalone:!0,features:[Q,V],decls:2,vars:5,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["fill-rule","evenodd","clip-rule","evenodd","d","M0.0535499 7.25213C0.208567 7.59162 2.40413 12.4 7 12.4C11.5959 12.4 13.7914 7.59162 13.9465 7.25213C13.9487 7.2471 13.9506 7.24304 13.952 7.24001C13.9837 7.16396 14 7.08239 14 7.00001C14 6.91762 13.9837 6.83605 13.952 6.76001C13.9506 6.75697 13.9487 6.75292 13.9465 6.74788C13.7914 6.4084 11.5959 1.60001 7 1.60001C2.40413 1.60001 0.208567 6.40839 0.0535499 6.74788C0.0512519 6.75292 0.0494023 6.75697 0.048 6.76001C0.0163137 6.83605 0 6.91762 0 7.00001C0 7.08239 0.0163137 7.16396 0.048 7.24001C0.0494023 7.24304 0.0512519 7.2471 0.0535499 7.25213ZM7 11.2C3.664 11.2 1.736 7.92001 1.264 7.00001C1.736 6.08001 3.664 2.80001 7 2.80001C10.336 2.80001 12.264 6.08001 12.736 7.00001C12.264 7.92001 10.336 11.2 7 11.2ZM5.55551 9.16182C5.98308 9.44751 6.48576 9.6 7 9.6C7.68891 9.59789 8.349 9.32328 8.83614 8.83614C9.32328 8.349 9.59789 7.68891 9.59999 7C9.59999 6.48576 9.44751 5.98308 9.16182 5.55551C8.87612 5.12794 8.47006 4.7947 7.99497 4.59791C7.51988 4.40112 6.99711 4.34963 6.49276 4.44995C5.98841 4.55027 5.52513 4.7979 5.16152 5.16152C4.7979 5.52513 4.55027 5.98841 4.44995 6.49276C4.34963 6.99711 4.40112 7.51988 4.59791 7.99497C4.7947 8.47006 5.12794 8.87612 5.55551 9.16182ZM6.2222 5.83594C6.45243 5.6821 6.7231 5.6 7 5.6C7.37065 5.6021 7.72553 5.75027 7.98762 6.01237C8.24972 6.27446 8.39789 6.62934 8.4 7C8.4 7.27689 8.31789 7.54756 8.16405 7.77779C8.01022 8.00802 7.79157 8.18746 7.53575 8.29343C7.27994 8.39939 6.99844 8.42711 6.72687 8.37309C6.4553 8.31908 6.20584 8.18574 6.01005 7.98994C5.81425 7.79415 5.68091 7.54469 5.6269 7.27312C5.57288 7.00155 5.6006 6.72006 5.70656 6.46424C5.81253 6.20842 5.99197 5.98977 6.2222 5.83594Z","fill","currentColor"]],template:function(n,t){n&1&&(N(),l(0,"svg",0),b(1,"path",1),c()),n&2&&(k(t.getClassNames()),d("aria-label",t.ariaLabel)("aria-hidden",t.ariaHidden)("role",t.role))},encapsulation:2})}return i})();var Ee=(()=>{class i extends se{pathId;ngOnInit(){this.pathId="url(#"+Ze()+")"}static \u0275fac=(()=>{let e;return function(t){return(e||(e=U(i)))(t||i)}})();static \u0275cmp=w({type:i,selectors:[["EyeSlashIcon"]],standalone:!0,features:[Q,V],decls:6,vars:7,consts:[["width","14","height","14","viewBox","0 0 14 14","fill","none","xmlns","http://www.w3.org/2000/svg"],["fill-rule","evenodd","clip-rule","evenodd","d","M13.9414 6.74792C13.9437 6.75295 13.9455 6.757 13.9469 6.76003C13.982 6.8394 14.0001 6.9252 14.0001 7.01195C14.0001 7.0987 13.982 7.1845 13.9469 7.26386C13.6004 8.00059 13.1711 8.69549 12.6674 9.33515C12.6115 9.4071 12.54 9.46538 12.4582 9.50556C12.3765 9.54574 12.2866 9.56678 12.1955 9.56707C12.0834 9.56671 11.9737 9.53496 11.8788 9.47541C11.7838 9.41586 11.7074 9.3309 11.6583 9.23015C11.6092 9.12941 11.5893 9.01691 11.6008 8.90543C11.6124 8.79394 11.6549 8.68793 11.7237 8.5994C12.1065 8.09726 12.4437 7.56199 12.7313 6.99995C12.2595 6.08027 10.3402 2.8014 6.99732 2.8014C6.63723 2.80218 6.27816 2.83969 5.92569 2.91336C5.77666 2.93304 5.62568 2.89606 5.50263 2.80972C5.37958 2.72337 5.29344 2.59398 5.26125 2.44714C5.22907 2.30031 5.2532 2.14674 5.32885 2.01685C5.40451 1.88696 5.52618 1.79021 5.66978 1.74576C6.10574 1.64961 6.55089 1.60134 6.99732 1.60181C11.5916 1.60181 13.7864 6.40856 13.9414 6.74792ZM2.20333 1.61685C2.35871 1.61411 2.5091 1.67179 2.6228 1.77774L12.2195 11.3744C12.3318 11.4869 12.3949 11.6393 12.3949 11.7983C12.3949 11.9572 12.3318 12.1097 12.2195 12.2221C12.107 12.3345 11.9546 12.3976 11.7956 12.3976C11.6367 12.3976 11.4842 12.3345 11.3718 12.2221L10.5081 11.3584C9.46549 12.0426 8.24432 12.4042 6.99729 12.3981C2.403 12.3981 0.208197 7.59135 0.0532336 7.25198C0.0509364 7.24694 0.0490875 7.2429 0.0476856 7.23986C0.0162332 7.16518 3.05176e-05 7.08497 3.05176e-05 7.00394C3.05176e-05 6.92291 0.0162332 6.8427 0.0476856 6.76802C0.631261 5.47831 1.46902 4.31959 2.51084 3.36119L1.77509 2.62545C1.66914 2.51175 1.61146 2.36136 1.61421 2.20597C1.61695 2.05059 1.6799 1.90233 1.78979 1.79244C1.89968 1.68254 2.04794 1.6196 2.20333 1.61685ZM7.45314 8.35147L5.68574 6.57609V6.5361C5.5872 6.78938 5.56498 7.06597 5.62183 7.33173C5.67868 7.59749 5.8121 7.84078 6.00563 8.03158C6.19567 8.21043 6.43052 8.33458 6.68533 8.39089C6.94014 8.44721 7.20543 8.43359 7.45314 8.35147ZM1.26327 6.99994C1.7351 7.91163 3.64645 11.1985 6.99729 11.1985C7.9267 11.2048 8.8408 10.9618 9.64438 10.4947L8.35682 9.20718C7.86027 9.51441 7.27449 9.64491 6.69448 9.57752C6.11446 9.51014 5.57421 9.24881 5.16131 8.83592C4.74842 8.42303 4.4871 7.88277 4.41971 7.30276C4.35232 6.72274 4.48282 6.13697 4.79005 5.64041L3.35855 4.2089C2.4954 5.00336 1.78523 5.94935 1.26327 6.99994Z","fill","currentColor"],[3,"id"],["width","14","height","14","fill","white"]],template:function(n,t){n&1&&(N(),l(0,"svg",0)(1,"g"),b(2,"path",1),c(),l(3,"defs")(4,"clipPath",2),b(5,"rect",3),c()()()),n&2&&(k(t.getClassNames()),d("aria-label",t.ariaLabel)("aria-hidden",t.ariaHidden)("role",t.role),r(),d("clip-path",t.pathId),r(3),o("id",t.pathId))},encapsulation:2})}return i})();var Dt=["input"],Ot=(i,a)=>({showTransitionParams:i,hideTransitionParams:a}),At=i=>({value:"visible",params:i}),zt=i=>({width:i});function Bt(i,a){if(i&1){let e=C();l(0,"TimesIcon",10),v("click",function(){m(e);let t=p(2);return h(t.clear())}),c()}i&2&&(o("styleClass","p-password-clear-icon"),d("data-pc-section","clearIcon"))}function jt(i,a){}function Ht(i,a){i&1&&u(0,jt,0,0,"ng-template")}function Nt(i,a){if(i&1){let e=C();I(0),u(1,Bt,1,2,"TimesIcon",7),l(2,"span",8),v("click",function(){m(e);let t=p();return h(t.clear())}),u(3,Ht,1,0,null,9),c(),T()}if(i&2){let e=p();r(),o("ngIf",!e.clearIconTemplate),r(),d("data-pc-section","clearIcon"),r(),o("ngTemplateOutlet",e.clearIconTemplate)}}function Ut(i,a){if(i&1){let e=C();l(0,"EyeSlashIcon",12),v("click",function(){m(e);let t=p(3);return h(t.onMaskToggle())}),c()}i&2&&d("data-pc-section","hideIcon")}function Qt(i,a){}function Kt(i,a){i&1&&u(0,Qt,0,0,"ng-template")}function Zt(i,a){if(i&1){let e=C();l(0,"span",12),v("click",function(){m(e);let t=p(3);return h(t.onMaskToggle())}),u(1,Kt,1,0,null,9),c()}if(i&2){let e=p(3);r(),o("ngTemplateOutlet",e.hideIconTemplate)}}function qt(i,a){if(i&1&&(I(0),u(1,Ut,1,1,"EyeSlashIcon",11)(2,Zt,2,1,"span",11),T()),i&2){let e=p(2);r(),o("ngIf",!e.hideIconTemplate),r(),o("ngIf",e.hideIconTemplate)}}function Gt(i,a){if(i&1){let e=C();l(0,"EyeIcon",12),v("click",function(){m(e);let t=p(3);return h(t.onMaskToggle())}),c()}i&2&&d("data-pc-section","showIcon")}function Wt(i,a){}function $t(i,a){i&1&&u(0,Wt,0,0,"ng-template")}function Jt(i,a){if(i&1){let e=C();l(0,"span",12),v("click",function(){m(e);let t=p(3);return h(t.onMaskToggle())}),u(1,$t,1,0,null,9),c()}if(i&2){let e=p(3);r(),o("ngTemplateOutlet",e.showIconTemplate)}}function Xt(i,a){if(i&1&&(I(0),u(1,Gt,1,1,"EyeIcon",11)(2,Jt,2,1,"span",11),T()),i&2){let e=p(2);r(),o("ngIf",!e.showIconTemplate),r(),o("ngIf",e.showIconTemplate)}}function Yt(i,a){if(i&1&&(I(0),u(1,qt,3,2,"ng-container",5)(2,Xt,3,2,"ng-container",5),T()),i&2){let e=p();r(),o("ngIf",e.unmasked),r(),o("ngIf",!e.unmasked)}}function ei(i,a){i&1&&Z(0)}function ti(i,a){i&1&&Z(0)}function ii(i,a){if(i&1&&(I(0),u(1,ti,1,0,"ng-container",9),T()),i&2){let e=p(2);r(),o("ngTemplateOutlet",e.contentTemplate)}}function ni(i,a){if(i&1&&(l(0,"div",15),b(1,"div",3),R(2,"mapper"),c(),l(3,"div",16),x(4),c()),i&2){let e=p(2);d("data-pc-section","meter"),r(),o("ngClass",D(2,6,e.meter,e.strengthClass))("ngStyle",ge(9,zt,e.meter?e.meter.width:"")),d("data-pc-section","meterLabel"),r(2),d("data-pc-section","info"),r(),Be(e.infoText)}}function ai(i,a){i&1&&Z(0)}function ri(i,a){if(i&1){let e=C();l(0,"div",13,1),v("click",function(t){m(e);let s=p();return h(s.onOverlayClick(t))})("@overlayAnimation.start",function(t){m(e);let s=p();return h(s.onAnimationStart(t))})("@overlayAnimation.done",function(t){m(e);let s=p();return h(s.onAnimationEnd(t))}),u(2,ei,1,0,"ng-container",9)(3,ii,2,1,"ng-container",14)(4,ni,5,11,"ng-template",null,2,Ne)(6,ai,1,0,"ng-container",9),c()}if(i&2){let e=P(5),n=p();o("ngClass","p-password-panel p-component")("@overlayAnimation",ge(10,At,je(7,Ot,n.showTransitionOptions,n.hideTransitionOptions))),d("data-pc-section","panel"),r(2),o("ngTemplateOutlet",n.headerTemplate),r(),o("ngIf",n.contentTemplate)("ngIfElse",e),r(3),o("ngTemplateOutlet",n.footerTemplate)}}var oi=(()=>{class i{transform(e,n,...t){return n(e,...t)}static \u0275fac=function(n){return new(n||i)};static \u0275pipe=Pe({name:"mapper",type:i,pure:!0})}return i})(),si={provide:le,useExisting:B(()=>Le),multi:!0},Le=(()=>{class i{document;platformId;renderer;cd;config;el;overlayService;ariaLabel;ariaLabelledBy;label;disabled;promptLabel;mediumRegex="^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})";strongRegex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})";weakLabel;mediumLabel;maxLength;strongLabel;inputId;feedback=!0;appendTo;toggleMask;inputStyleClass;styleClass;style;inputStyle;showTransitionOptions=".12s cubic-bezier(0, 0, 0.2, 1)";hideTransitionOptions=".1s linear";autocomplete;placeholder;showClear=!1;autofocus;variant="outlined";onFocus=new S;onBlur=new S;onClear=new S;input;contentTemplate;footerTemplate;headerTemplate;clearIconTemplate;hideIconTemplate;showIconTemplate;templates;overlayVisible=!1;meter;infoText;focused=!1;unmasked=!1;mediumCheckRegExp;strongCheckRegExp;resizeListener;scrollHandler;overlay;value=null;onModelChange=()=>{};onModelTouched=()=>{};translationSubscription;constructor(e,n,t,s,f,_,fe){this.document=e,this.platformId=n,this.renderer=t,this.cd=s,this.config=f,this.el=_,this.overlayService=fe}ngAfterContentInit(){this.templates.forEach(e=>{switch(e.getType()){case"content":this.contentTemplate=e.template;break;case"header":this.headerTemplate=e.template;break;case"footer":this.footerTemplate=e.template;break;case"clearicon":this.clearIconTemplate=e.template;break;case"hideicon":this.hideIconTemplate=e.template;break;case"showicon":this.showIconTemplate=e.template;break;default:this.contentTemplate=e.template;break}})}ngOnInit(){this.infoText=this.promptText(),this.mediumCheckRegExp=new RegExp(this.mediumRegex),this.strongCheckRegExp=new RegExp(this.strongRegex),this.translationSubscription=this.config.translationObserver.subscribe(()=>{this.updateUI(this.value||"")})}onAnimationStart(e){switch(e.toState){case"visible":this.overlay=e.element,ne.set("overlay",this.overlay,this.config.zIndex.overlay),this.appendContainer(),this.alignOverlay(),this.bindScrollListener(),this.bindResizeListener();break;case"void":this.unbindScrollListener(),this.unbindResizeListener(),this.overlay=null;break}}onAnimationEnd(e){switch(e.toState){case"void":ne.clear(e.element);break}}appendContainer(){this.appendTo&&(this.appendTo==="body"?this.renderer.appendChild(this.document.body,this.overlay):this.document.getElementById(this.appendTo).appendChild(this.overlay))}alignOverlay(){this.appendTo?(this.overlay.style.minWidth=A.getOuterWidth(this.input.nativeElement)+"px",A.absolutePosition(this.overlay,this.input.nativeElement)):A.relativePosition(this.overlay,this.input.nativeElement)}onInput(e){this.value=e.target.value,this.onModelChange(this.value)}onInputFocus(e){this.focused=!0,this.feedback&&(this.overlayVisible=!0),this.onFocus.emit(e)}onInputBlur(e){this.focused=!1,this.feedback&&(this.overlayVisible=!1),this.onModelTouched(),this.onBlur.emit(e)}onKeyUp(e){if(this.feedback){let n=e.target.value;if(this.updateUI(n),e.code==="Escape"){this.overlayVisible&&(this.overlayVisible=!1);return}this.overlayVisible||(this.overlayVisible=!0)}}updateUI(e){let n=null,t=null;switch(this.testStrength(e)){case 1:n=this.weakText(),t={strength:"weak",width:"33.33%"};break;case 2:n=this.mediumText(),t={strength:"medium",width:"66.66%"};break;case 3:n=this.strongText(),t={strength:"strong",width:"100%"};break;default:n=this.promptText(),t=null;break}this.meter=t,this.infoText=n}onMaskToggle(){this.unmasked=!this.unmasked}onOverlayClick(e){this.overlayService.add({originalEvent:e,target:this.el.nativeElement})}testStrength(e){let n=0;return this.strongCheckRegExp.test(e)?n=3:this.mediumCheckRegExp.test(e)?n=2:e.length&&(n=1),n}writeValue(e){e===void 0?this.value=null:this.value=e,this.feedback&&this.updateUI(this.value||""),this.cd.markForCheck()}registerOnChange(e){this.onModelChange=e}registerOnTouched(e){this.onModelTouched=e}setDisabledState(e){this.disabled=e,this.cd.markForCheck()}bindScrollListener(){be(this.platformId)&&(this.scrollHandler||(this.scrollHandler=new Ge(this.input.nativeElement,()=>{this.overlayVisible&&(this.overlayVisible=!1)})),this.scrollHandler.bindScrollListener())}bindResizeListener(){if(be(this.platformId)&&!this.resizeListener){let e=this.document.defaultView;this.resizeListener=this.renderer.listen(e,"resize",()=>{this.overlayVisible&&!A.isTouchDevice()&&(this.overlayVisible=!1)})}}unbindScrollListener(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()}unbindResizeListener(){this.resizeListener&&(this.resizeListener(),this.resizeListener=null)}containerClass(e){return{"p-password p-component p-inputwrapper":!0,"p-input-icon-right":e}}inputFieldClass(e){return{"p-password-input":!0,"p-disabled":e}}strengthClass(e){return`p-password-strength ${e?e.strength:""}`}filled(){return this.value!=null&&this.value.toString().length>0}promptText(){return this.promptLabel||this.getTranslation(O.PASSWORD_PROMPT)}weakText(){return this.weakLabel||this.getTranslation(O.WEAK)}mediumText(){return this.mediumLabel||this.getTranslation(O.MEDIUM)}strongText(){return this.strongLabel||this.getTranslation(O.STRONG)}restoreAppend(){this.overlay&&this.appendTo&&(this.appendTo==="body"?this.renderer.removeChild(this.document.body,this.overlay):this.document.getElementById(this.appendTo).removeChild(this.overlay))}inputType(e){return e?"text":"password"}getTranslation(e){return this.config.getTranslation(e)}clear(){this.value=null,this.onModelChange(this.value),this.writeValue(this.value),this.onClear.emit()}ngOnDestroy(){this.overlay&&(ne.clear(this.overlay),this.overlay=null),this.restoreAppend(),this.unbindResizeListener(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.translationSubscription&&this.translationSubscription.unsubscribe()}static \u0275fac=function(n){return new(n||i)(g(Ue),g(Oe),g(Ae),g(J),g(ae),g(De),g(qe))};static \u0275cmp=w({type:i,selectors:[["p-password"]],contentQueries:function(n,t,s){if(n&1&&q(s,re,4),n&2){let f;E(f=L())&&(t.templates=f)}},viewQuery:function(n,t){if(n&1&&G(Dt,5),n&2){let s;E(s=L())&&(t.input=s.first)}},hostAttrs:[1,"p-element","p-inputwrapper"],hostVars:8,hostBindings:function(n,t){n&2&&ze("p-inputwrapper-filled",t.filled())("p-inputwrapper-focus",t.focused)("p-password-clearable",t.showClear)("p-password-mask",t.toggleMask)},inputs:{ariaLabel:"ariaLabel",ariaLabelledBy:"ariaLabelledBy",label:"label",disabled:[2,"disabled","disabled",y],promptLabel:"promptLabel",mediumRegex:"mediumRegex",strongRegex:"strongRegex",weakLabel:"weakLabel",mediumLabel:"mediumLabel",maxLength:[2,"maxLength","maxLength",X],strongLabel:"strongLabel",inputId:"inputId",feedback:[2,"feedback","feedback",y],appendTo:"appendTo",toggleMask:[2,"toggleMask","toggleMask",y],inputStyleClass:"inputStyleClass",styleClass:"styleClass",style:"style",inputStyle:"inputStyle",showTransitionOptions:"showTransitionOptions",hideTransitionOptions:"hideTransitionOptions",autocomplete:"autocomplete",placeholder:"placeholder",showClear:[2,"showClear","showClear",y],autofocus:[2,"autofocus","autofocus",y],variant:"variant"},outputs:{onFocus:"onFocus",onBlur:"onBlur",onClear:"onClear"},features:[$([si]),K],decls:9,vars:35,consts:[["input",""],["overlay",""],["content",""],[3,"ngClass","ngStyle"],["pInputText","","pAutoFocus","",3,"input","focus","blur","keyup","ngClass","disabled","ngStyle","value","variant","autofocus"],[4,"ngIf"],[3,"ngClass","click",4,"ngIf"],[3,"styleClass","click",4,"ngIf"],[1,"p-password-clear-icon",3,"click"],[4,"ngTemplateOutlet"],[3,"click","styleClass"],[3,"click",4,"ngIf"],[3,"click"],[3,"click","ngClass"],[4,"ngIf","ngIfElse"],[1,"p-password-meter"],[1,"p-password-info"]],template:function(n,t){if(n&1){let s=C();l(0,"div",3),R(1,"mapper"),l(2,"input",4,0),R(4,"mapper"),R(5,"mapper"),v("input",function(_){return m(s),h(t.onInput(_))})("focus",function(_){return m(s),h(t.onInputFocus(_))})("blur",function(_){return m(s),h(t.onInputBlur(_))})("keyup",function(_){return m(s),h(t.onKeyUp(_))}),c(),u(6,Nt,4,3,"ng-container",5)(7,Yt,3,2,"ng-container",5)(8,ri,7,12,"div",6),c()}n&2&&(k(t.styleClass),o("ngClass",D(1,26,t.toggleMask,t.containerClass))("ngStyle",t.style),d("data-pc-name","password")("data-pc-section","root"),r(2),k(t.inputStyleClass),o("ngClass",D(4,29,t.disabled,t.inputFieldClass))("disabled",t.disabled)("ngStyle",t.inputStyle)("value",t.value)("variant",t.variant)("autofocus",t.autofocus),d("label",t.label)("aria-label",t.ariaLabel)("aria-labelledBy",t.ariaLabelledBy)("id",t.inputId)("type",D(5,32,t.unmasked,t.inputType))("placeholder",t.placeholder)("autocomplete",t.autocomplete)("maxlength",t.maxLength)("data-pc-section","input"),r(4),o("ngIf",t.showClear&&t.value!=null),r(),o("ngIf",t.toggleMask),r(),o("ngIf",t.overlayVisible))},dependencies:()=>[Y,ee,ie,te,de,ce,xe,Ee,Se,oi],styles:[`@layer primeng{.p-password{position:relative;display:inline-flex}.p-password-panel{position:absolute;top:0;left:0}.p-password .p-password-panel{min-width:100%}.p-password-meter{height:10px}.p-password-strength{height:100%;width:0%;transition:width 1s ease-in-out}.p-fluid .p-password{display:flex}.p-password-input::-ms-reveal,.p-password-input::-ms-clear{display:none}.p-password-clear-icon{position:absolute;top:50%;margin-top:-.5rem;cursor:pointer}.p-password .p-icon{cursor:pointer}.p-password-clearable.p-password-mask .p-password-clear-icon{margin-top:unset}.p-password-clearable{position:relative}}
`],encapsulation:2,data:{animation:[We("overlayAnimation",[we(":enter",[ye({opacity:0,transform:"scaleY(0.8)"}),Ce("{{showTransitionParams}}")]),we(":leave",[Ce("{{hideTransitionParams}}",ye({opacity:0}))])])]},changeDetection:0})}return i})(),ft=(()=>{class i{static \u0275fac=function(n){return new(n||i)};static \u0275mod=H({type:i});static \u0275inj=j({imports:[M,ue,pe,xe,Ee,Se,oe]})}return i})();var gt={name:"kinvo-extended",version:"1.1.1",private:!1,engines:{node:"20.12.0",npm:"10.5.0",nvm:"1.1.11"},homepage:"https://github.com/jefmenegazzo/kinvo-extended",repository:{type:"git",url:"git+https://github.com/jefmenegazzo/kinvo-extended"},scripts:{ng:"ng",start:"ng serve",build:"ng build",watch:"ng build --watch --configuration development",test:"ng test",lint:"ng lint"},dependencies:{"@angular/animations":"^18.2.0","@angular/common":"^18.2.0","@angular/compiler":"^18.2.0","@angular/core":"^18.2.0","@angular/fire":"^18.0.1","@angular/forms":"^18.2.0","@angular/platform-browser":"^18.2.0","@angular/platform-browser-dynamic":"^18.2.0","@angular/router":"^18.2.0","@angular/service-worker":"^18.2.0","chart.js":"^4.4.4","chartjs-adapter-date-fns":"^3.0.0","chartjs-plugin-datalabels":"^2.2.0","chartjs-plugin-zoom":"^2.0.1","date-fns":"^4.1.0",firebase:"^10.14.0",idb:"^8.0.0","material-symbols":"^0.23.0",primeicons:"^7.0.0",primeng:"^17.18.10",rxjs:"~7.8.0",tslib:"^2.3.0","zone.js":"~0.14.10"},devDependencies:{"@angular-devkit/build-angular":"^18.2.5","@angular/cli":"^18.2.5","@angular/compiler-cli":"^18.2.0","@angular/localize":"^18.2.5","@types/chart.js":"^2.9.41","@types/jasmine":"~5.1.0","angular-cli-ghpages":"^2.0.1","angular-eslint":"18.3.1",autoprefixer:"^10.4.20",eslint:"^9.9.1","jasmine-core":"~5.2.0",karma:"~6.4.0","karma-chrome-launcher":"~3.2.0","karma-coverage":"~2.2.0","karma-jasmine":"~5.1.0","karma-jasmine-html-reporter":"~2.1.0",postcss:"^8.4.47",tailwindcss:"^3.4.13",typescript:"~5.5.2","typescript-eslint":"8.2.0"}};var me=class i{constructor(a){this.firestore=a}incrementUserAccessCount(a){return F(this,null,function*(){let e={email:a,accessCount:Ye(1)},n=Xe(this.firestore,"user_access",e.email);yield et(n,e,{merge:!0})})}static \u0275fac=function(e){return new(e||i)(Fe(Je))};static \u0275prov=Me({token:i,factory:i.\u0275fac,providedIn:"root"})};var he=class i{constructor(a,e,n,t,s){this.fb=a;this.router=e;this.kinvoServiceApi=n;this.sessionService=t;this.firebaseService=s}loginForm;loading=!1;version=gt.version;ngOnInit(){this.loginForm=this.fb.group({user:["",Ie.required],password:["",Ie.required],remember:[!0]}),this.loadStorage().then(()=>{}).catch(a=>{})}loadStorage(){return F(this,null,function*(){if(yield this.sessionService.isEncryptedDataInStorage()){let e=yield this.sessionService.loadCryptoKey(),n=yield this.sessionService.decryptDataFromStorage(e);this.loginForm.patchValue(n),this.onSubmit()}})}onSubmit(){this.loginForm.markAllAsTouched(),this.loginForm.markAsDirty();for(let a of Object.values(this.loginForm.controls))a.markAsDirty();this.loginForm.valid&&(this.loginForm.disable(),this.loading=!0,this.kinvoServiceApi.login(this.loginForm.value.user,this.loginForm.value.password,this.loginForm.value.remember).pipe(Ve(()=>{this.loginForm.enable(),this.loading=!1})).subscribe({next:a=>F(this,null,function*(){a&&a.success&&(yield this.router.navigate(["analises"]),yield this.firebaseService.incrementUserAccessCount(this.loginForm.value.user))})}))}static \u0275fac=function(e){return new(e||i)(g(lt),g(Qe),g(mt),g($e),g(me))};static \u0275cmp=w({type:i,selectors:[["app-login"]],standalone:!0,features:[V],decls:23,vars:6,consts:[[1,"flex","items-center","justify-center","h-full","w-full","bg-white","md:bg-gray-100"],[1,"flex","flex-col","landscape:flex-row","md:landscape:flex-col","bg-white","p-12","rounded-lg","md:shadow-md"],[1,"flex","flex-col","text-center","w-[275px]"],["src","logo.svg","alt","Logo",1,"w-36","h-36","mx-auto"],["src","kinvo-extended-logo.svg","alt","Logo",1,"w-48","h-20","mx-auto"],[2,"font-size","25px","color","#0dcee6"],[1,"flex","flex-col","mt-0","mr-8","md:landscape:mr-0","portrait:mr-0","md:landscape:mt-8","portrait:mt-8","w-[275px]"],[3,"ngSubmit","formGroup"],["for","email",1,"block","text-900","font-semibold","mb-2"],["pInputText","","id","email","type","text","placeholder","E-mail","formControlName","user",1,"w-full","mb-8"],["for","password",1,"block","text-900","font-semibold","mb-2"],["id","password","styleClass","w-full mb-8","inputStyleClass","w-full","placeholder","Senha","formControlName","password",3,"toggleMask","feedback"],[1,"flex","mb-8"],["id","rememberme","styleClass","mr-2","formControlName","remember",3,"binary"],["for","rememberme1"],["pButton","","pRipple","","label","Entrar","icon","pi pi-user","type","submit",1,"w-full",3,"loading"],[1,"version-div"]],template:function(e,n){e&1&&(l(0,"div",0)(1,"div",1)(2,"div",2),b(3,"img",3)(4,"img",4),l(5,"span",5),x(6,"extended"),c()(),l(7,"div",6)(8,"form",7),v("ngSubmit",function(){return n.onSubmit()}),l(9,"label",8),x(10,"E-mail"),c(),b(11,"input",9),l(12,"label",10),x(13,"Senha"),c(),b(14,"p-password",11),l(15,"div",12),b(16,"p-checkbox",13),l(17,"label",14),x(18,"Lembrar dados"),c()(),b(19,"button",15),c()()()(),l(20,"div",16)(21,"span"),x(22),c()()),e&2&&(r(8),o("formGroup",n.loginForm),r(6),o("toggleMask",!0)("feedback",!1),r(2),o("binary",!0),r(3),o("loading",n.loading),r(3),W("Vers\xE3o: ",n.version,""))},dependencies:[M,ct,rt,tt,nt,at,pt,ot,st,ut,dt,ue,de,ft,Le,Ke,ht,Te],styles:[".version-div[_ngcontent-%COMP%]{position:fixed;bottom:12px;right:12px}"]})};var Mn=[{path:"",component:he}];export{Mn as remoteRoutes};
