(function(){var g,t=Array.prototype.indexOf||function(q){for(var i=0,b=this.length;i<b;i++)if(this[i]===q)return i;return-1};g=jQuery;g.hailwhale=function(q,i){this.host=q;this.opts=i;this.make_params=function(b){return{categories:JSON.stringify(b.categories||b.category||""),dimensions:JSON.stringify(b.dimensions||b.dimension||""),metrics:JSON.stringify(b.metrics||b.metric||""),period:b.period||""}};this.trigger_fake_hits=function(b){var a,j,k,l;l=this.host+"/count_now";j=this.make_params(b);k=function(){return g.ajax({url:l,
data:j,type:"GET",success:false})};for(a=1;a<=25;a++){b=Math.floor(Math.random()*11);setTimeout(k,75*a*b)}return this};this.add_graph=function(b,a){var j,k,l;l=this.host+"/plotpoints";a=g.extend(a,{categories:a.categories||a.category||false,dimensions:a.dimensions||a.dimension||false,metrics:a.metrics||a.metric||false,metric:a.metrics&&a.metrics[0]||a.metric||false,metric_two:a.metrics&&a.metrics[1]?a.metrics[1]:false,width_factor:a.width_factor||6});j=this.make_params(a);j.depth=a.depth||0;k=function(){return g.getJSON(l,
j,function(e){var f,c,h,r,s,d,m,p,n,o,u,v;p=[];f=a.colors||["#000000","#261AFF","#0ED42F","#E84414","#F5E744","#36B9FF"];s=0;o=10;c=0;r={};for(h in e){n=e[h];d=JSON.parse(h);if(d[0]==="_")d=[];if(d.length<o)o=d.length;if(d.length>c)c=d.length;r[h]={unpacked:d,length:d.length,metrics:get_keys(n)}}for(h in e){n=e[h];c=r[h];if(!a.metric)a.metric=c.metrics[0];if(!a.metric_two&&c.metrics.length>1)a.metric_two=c.metrics[1];if(u=!a.metric,t.call(c.metrics,u)>=0)break;if(a.depth)if(c.length===o){d="Overall "+
c.unpacked;m=a.width_factor}else{d=c.unpacked[0];m=a.width_factor/(0.5+(c.length-o))}else{d=c.unpacked[0]||"Overall";m=a.width_factor*3/4}p.push({data:n[a.metric],lines:{show:true,lineWidth:m},color:f[s++%f.length],label:d+" "+a.metric});if(v=a.metric_two,t.call(c.metrics,v)>=0)p.push({data:n[a.metric_two],lines:{show:true,lineWidth:m},color:f[s%f.length],label:d+" "+a.metric_two,yaxis:2})}e={min:0};f=g.extend({},e);f.position="right";if(f.label=a.metric_two){e=[e,f];console.log("yaxis:",e)}return g.plot(b,
p,{legend:{show:true,position:"sw"},xaxis:{mode:"time"},yaxes:e})})};k();if(a.autoupdate)return setInterval(k,a.interval||1E3)};return this}}).call(this);