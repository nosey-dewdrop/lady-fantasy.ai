"use client";
import{useState,useEffect}from"react";
import{TAROT_DECK,SUIT_INFO}from"./tarotDeck.js";
const MODELS=[
{id:"fal-ai/minimax/video-01",name:"MiniMax Video-01",cost:"~$0.50"},
{id:"fal-ai/minimax/video-01-live",name:"MiniMax Live",cost:"~$0.50"},
{id:"fal-ai/minimax/hailuo-02/standard/text-to-video",name:"Hailuo-02",cost:"~$0.27"},
];
const F="'Cinzel',serif",G="'Cormorant Garamond',serif";
export default function Page(){
const[phase,setPhase]=useState("intro");
const[model,setModel]=useState(MODELS[0].id);
const[deck,setDeck]=useState([]);
const[sel,setSel]=useState([]);
const[rev,setRev]=useState([]);
const[video,setVideo]=useState("");
const[stat,setStat]=useState("");
const[err,setErr]=useState("");
const[hov,setHov]=useState(null);
const[nc,setNc]=useState(3);
const[fade,setFade]=useState(false);
useEffect(()=>setFade(true),[]);
const L=nc===3?["Past","Present","Future"]:["Situation","Challenge","Subconscious","Past","Future"];
const start=()=>{setDeck([...TAROT_DECK].sort(()=>Math.random()-0.5));setSel([]);setRev([]);setVideo("");setErr("");setPhase("spread");};
const pick=i=>{if(sel.length>=nc||sel.includes(i))return;const n=[...sel,i];setSel(n);setTimeout(()=>setRev(p=>[...p,i]),300);if(n.length===nc)setTimeout(()=>setPhase("reading"),1200);};
const gc=()=>sel.map(i=>deck[i]);
const prompt=(cs)=>{
const S={
"The Fool":"a young man laughing runs and leaps off a cliff edge into swirling golden clouds below, his coat billowing in the wind, a small white dog chases after him",
"The Magician":"a man in a dark robe stands before a stone altar and slowly raises both hands, streams of fire and water spiral around his body faster and faster",
"The High Priestess":"a woman in flowing blue robes slowly parts a curtain of falling water with her hands, revealing a glowing cave, she steps through as moonlight pours in",
"The Empress":"a woman in a golden dress walks through a barren grey forest, with every footstep colorful flowers and vines burst from the ground and trees bloom instantly",
"The Emperor":"a man in crimson armor rises from a massive stone throne on a windy cliff, his cape whipping behind him as golden eagles launch into the sky around him",
"The Hierophant":"an old bearded man opens a giant ancient book, glowing golden letters rise from the pages and float upward into the dark cathedral ceiling like fireflies",
"The Lovers":"a man and woman walk toward each other from opposite ends of a misty bridge, when their hands touch a burst of warm golden light radiates outward",
"The Chariot":"a warrior in golden armor drives a chariot at full speed through rain, pulled by a black horse and white horse, sparks flying from the chariot wheels",
"Strength":"a woman in white slowly approaches a roaring lion, she gently touches its mane, the lion closes its eyes and warm golden light pulses from where she touches",
"The Hermit":"a hooded old man climbs a steep snowy path alone at night carrying a glowing lantern, the northern lights slowly appear and dance across the sky above him",
"Wheel of Fortune":"a massive ornate golden wheel slowly rotates in deep space, tiny figures cling to its edges rising and falling as galaxies drift past in the background",
"Justice":"a woman in red raises a gleaming sword high and swings it down, slicing a beam of white light perfectly in half, the two halves slowly separate illuminating a dark hall",
"The Hanged Man":"a man hangs upside down from a massive ancient tree by one ankle, completely serene, golden autumn leaves drift down around him in extreme slow motion",
"Death":"a knight on a pale horse gallops across a grey wasteland, behind him everything crumbles but ahead the dust transforms into swarms of butterflies and green growth",
"Temperance":"a winged figure standing between land and river pours glowing liquid between two golden cups, a shimmering rainbow arc forms in the mist between the cups",
"The Devil":"two chained figures dance frantically around a dark bonfire, one suddenly grabs their chain and snaps it, then turns and walks calmly into a shaft of white light",
"The Tower":"a massive bolt of lightning strikes the top of a stone tower at night, the crown explodes into fragments, two silhouettes leap from windows as fire erupts within",
"The Star":"a woman kneels beside a perfectly still pool under a sky full of stars, she pours water from two vessels, the pool reflects the entire cosmos above her",
"The Moon":"a wolf and a dog howl at an enormous glowing full moon, fog rolls across a winding path between two dark towers, something stirs beneath the water nearby",
"The Sun":"a laughing child gallops on a white horse through an endless field of tall sunflowers under a massive warm golden sun, waving a bright red banner behind them",
"Judgement":"stone graves crack open across a wide field, human figures rise up reaching toward the sky, above them a golden angel blows a trumpet as storm clouds break apart",
"The World":"a woman dances gracefully inside a slowly spinning ring of stars in the void of space, a lion eagle bull and angel hover watching from the four corners",
};
const fb=(c)=>"a mysterious cloaked figure moves through a dark enchanted landscape experiencing "+c.meaning+", dramatic camera movement and magical lighting";
const best=cs.find(c=>S[c.name])||cs[0];
const scene=S[best.name]||fb(best);
return `Cinematic fantasy film shot. Slow dramatic camera push-in. ${scene}. No text overlay. No cards. No UI. Shot like a high budget movie. Dark moody color grading with deep purple shadows and warm gold highlights. Volumetric fog and god rays. Shallow depth of field. Slow motion. 8K.`;
};
const gen=async()=>{
setPhase("gen");setStat("Submitting...");setErr("");
try{
const r=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt(gc()),model})});
if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||"Submit failed");}
const d=await r.json();
if(d.video?.url){setVideo(d.video.url);setPhase("result");return;}
const{status_url,response_url}=d;
if(!status_url)throw new Error("No status URL");
setStat("In queue...");
for(let i=0;i<120;i++){
await new Promise(r=>setTimeout(r,3000));
const s=await fetch("/api/status?url="+encodeURIComponent(status_url));
if(s.ok){const j=await s.json();
if(j.status==="COMPLETED"){const rr=await fetch("/api/result?url="+encodeURIComponent(response_url));if(!rr.ok)throw new Error("Result failed");const res=await rr.json();if(res.video?.url){setVideo(res.video.url);setPhase("result");return;}throw new Error("No video URL");}
if(j.status==="FAILED")throw new Error("Generation failed");
if(j.status==="IN_PROGRESS")setStat("Creating your vision...");
if(j.status==="IN_QUEUE")setStat(j.queue_position!=null?"Queue #"+j.queue_position:"Waiting...");
}}throw new Error("Timed out");
}catch(e){setErr(e.message);setPhase("reading");}
};
const reset=()=>{setPhase("intro");setSel([]);setRev([]);setVideo("");setErr("");};
const bg={minHeight:"100vh",background:"linear-gradient(170deg,#080412,#0d0520 30%,#120a2a 60%,#080412)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative",overflow:"hidden"};
const ctr={display:"flex",flexDirection:"column",alignItems:"center",gap:16,width:"100%",maxWidth:900,zIndex:1};
if(phase==="intro")return(
<div style={bg}><style>{CSS}</style>
<div style={{...ctr,maxWidth:420,opacity:fade?1:0,transform:fade?"none":"translateY(30px)",transition:"all 1s ease"}}>
<div style={{fontSize:42,color:"#d4af37",animation:"float 3s ease-in-out infinite",fontFamily:F}}>&#10022;</div>
<h1 style={{fontFamily:F,fontSize:36,color:"#e8d5a3",margin:0,letterSpacing:8}}>Arcana Visio</h1>
<p style={{fontFamily:F,fontSize:11,color:"#d4af37",margin:0,letterSpacing:5}}>AI TAROT VIDEO</p>
<div style={{width:"100%",height:1,background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)",margin:"8px 0"}}/>
<p style={{fontFamily:G,fontSize:16,color:"rgba(232,213,163,0.5)",textAlign:"center",lineHeight:1.7}}>Draw from a full 78-card deck. AI weaves your cards into a mystical cinematic narrative.</p>
<div style={{display:"flex",gap:8,width:"100%"}}>
{[3,5].map(n=><button key={n} onClick={()=>setNc(n)} style={{flex:1,padding:"12px",borderRadius:8,border:nc===n?"1px solid #d4af37":"1px solid rgba(212,175,55,0.15)",background:nc===n?"rgba(212,175,55,0.1)":"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
<span style={{fontFamily:F,fontSize:14,color:"#e8d5a3"}}>{n} Cards</span>
<span style={{fontFamily:G,fontSize:11,color:"rgba(232,213,163,0.4)"}}>{n===3?"Past / Present / Future":"Celtic Cross"}</span>
</button>)}
</div>
<div style={{display:"flex",flexDirection:"column",gap:6,width:"100%"}}>
{MODELS.map(m=><button key={m.id} onClick={()=>setModel(m.id)} style={{padding:"10px 14px",borderRadius:8,border:model===m.id?"1px solid #d4af37":"1px solid rgba(212,175,55,0.15)",background:model===m.id?"rgba(212,175,55,0.1)":"transparent",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between"}}>
<span style={{fontFamily:F,fontSize:12,color:"#e8d5a3"}}>{m.name}</span>
<span style={{fontFamily:G,fontSize:11,color:"rgba(232,213,163,0.4)"}}>{m.cost}</span>
</button>)}
</div>
<button onClick={start} style={{fontFamily:F,fontSize:14,color:"#0a0514",background:"linear-gradient(135deg,#d4af37,#f0d060,#d4af37)",border:"none",borderRadius:8,padding:"14px 40px",cursor:"pointer",letterSpacing:3,width:"100%"}}>DRAW CARDS</button>
</div></div>);

if(phase==="spread")return(
<div style={bg}><style>{CSS}</style>
<div style={ctr}>
<h2 style={{fontFamily:F,fontSize:20,color:"#d4af37",margin:0,letterSpacing:4}}>{sel.length<nc?`Choose a Card (${sel.length}/${nc})`:"Revealing..."}</h2>
<p style={{fontFamily:G,fontSize:15,color:"rgba(232,213,163,0.5)",margin:0}}>{sel.length<nc&&`Select for: ${L[sel.length]}`}</p>
{sel.length>0&&<div style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap",margin:"12px 0"}}>
{sel.map((idx,i)=>rev.includes(idx)&&<div key={idx} style={{textAlign:"center",animation:"fadeUp 0.6s ease"}}>
<div style={{fontFamily:F,fontSize:10,color:"#d4af37",letterSpacing:3,marginBottom:6}}>{L[i]}</div>
<div style={{fontFamily:F,fontSize:14,color:"#e8d5a3"}}>{deck[idx].name}</div>
<div style={{fontFamily:G,fontSize:12,color:"rgba(232,213,163,0.5)",marginTop:4}}>{deck[idx].meaning}</div>
</div>)}
</div>}
<div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",padding:"0 8px"}}>
{deck.map((_,i)=><div key={i} onClick={sel.length<nc&&!sel.includes(i)?()=>pick(i):undefined}
onMouseEnter={()=>sel.length<nc&&!sel.includes(i)&&setHov(i)} onMouseLeave={()=>setHov(null)}
style={{width:56,height:88,borderRadius:6,cursor:sel.includes(i)?"default":"pointer",
background:sel.includes(i)?"rgba(42,26,78,0.5)":"linear-gradient(135deg,#1a0a3e,#2d1b69)",
border:sel.includes(i)?"1px solid #d4af37":hov===i?"1px solid rgba(212,175,55,0.7)":"1px solid rgba(212,175,55,0.12)",
display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s",
transform:hov===i&&!sel.includes(i)?"translateY(-10px) scale(1.06)":"scale(1)",
opacity:sel.includes(i)?0.3:1}}>
<span style={{fontSize:14,color:"rgba(212,175,55,0.25)",fontFamily:F}}>&#10022;</span>
</div>)}
</div>
<p style={{fontFamily:G,fontSize:11,color:"rgba(232,213,163,0.2)"}}>78 cards</p>
</div></div>);

if(phase==="reading"){const cs=gc();return(
<div style={bg}><style>{CSS}</style>
<div style={{...ctr,maxWidth:700}}>
<h2 style={{fontFamily:F,fontSize:24,color:"#d4af37",margin:0,letterSpacing:4}}>Your Cards</h2>
<div style={{display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap",margin:"20px 0"}}>
{cs.map((c,i)=><div key={i} style={{textAlign:"center",maxWidth:180,animation:`fadeUp 0.6s ease ${i*0.2}s both`}}>
<div style={{fontFamily:F,fontSize:10,color:"#d4af37",letterSpacing:3,marginBottom:10}}>{L[i]}</div>
<div style={{padding:"24px 16px",borderRadius:10,border:"1px solid rgba(212,175,55,0.2)",background:"rgba(13,5,32,0.8)"}}>
<div style={{fontFamily:F,fontSize:13,color:"#e8d5a3",letterSpacing:1}}>{c.num}</div>
<div style={{fontFamily:F,fontSize:15,color:"#e8d5a3",margin:"10px 0",lineHeight:1.3}}>{c.name}</div>
<div style={{fontFamily:G,fontSize:11,color:"rgba(212,175,55,0.5)"}}>{SUIT_INFO[c.suit]}</div>
</div>
<p style={{fontFamily:G,fontSize:13,color:"rgba(232,213,163,0.6)",marginTop:10,lineHeight:1.5}}>{c.meaning}</p>
</div>)}
</div>
{err&&<div style={{background:"rgba(200,50,50,0.1)",border:"1px solid rgba(200,50,50,0.2)",borderRadius:8,padding:"10px 16px"}}><p style={{fontFamily:G,color:"#e88",margin:0,fontSize:13}}>{err}</p></div>}
<div style={{display:"flex",gap:12}}>
<button onClick={gen} style={{fontFamily:F,fontSize:13,color:"#0a0514",background:"linear-gradient(135deg,#d4af37,#f0d060)",border:"none",borderRadius:8,padding:"14px 30px",cursor:"pointer",letterSpacing:2}}>GENERATE VIDEO</button>
<button onClick={reset} style={{fontFamily:F,fontSize:12,color:"#d4af37",background:"transparent",border:"1px solid rgba(212,175,55,0.3)",borderRadius:8,padding:"12px 20px",cursor:"pointer",letterSpacing:2}}>START OVER</button>
</div></div></div>);}

if(phase==="gen"){const cs=gc();return(
<div style={bg}><style>{CSS}</style>
<div style={{...ctr,maxWidth:400}}>
<div style={{position:"relative",width:90,height:90}}>
<div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(212,175,55,0.3)",animation:"spin 3s linear infinite"}}/>
<div style={{position:"absolute",inset:8,borderRadius:"50%",border:"1px solid rgba(212,175,55,0.15)",animation:"spin 5s linear infinite reverse"}}/>
<div style={{position:"absolute",inset:18,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,175,55,0.4),transparent 70%)",animation:"pulse 2s infinite"}}/>
<div style={{position:"absolute",top:"50%",left:8,right:8,height:1,background:"rgba(212,175,55,0.15)"}}/>
<div style={{position:"absolute",left:"50%",top:8,bottom:8,width:1,background:"rgba(212,175,55,0.15)"}}/>
</div>
<h2 style={{fontFamily:F,fontSize:20,color:"#d4af37",letterSpacing:4}}>Generating</h2>
<p style={{fontFamily:G,fontSize:15,color:"rgba(232,213,163,0.6)"}}>{stat}</p>
<div style={{display:"flex",gap:16}}>
{cs.map((c,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontFamily:F,fontSize:11,color:"#e8d5a3"}}>{c.name.split(" ").pop()}</div><div style={{fontFamily:G,fontSize:10,color:"rgba(232,213,163,0.4)"}}>{L[i]}</div></div>)}
</div>
<div style={{width:180,height:3,borderRadius:2,background:"rgba(212,175,55,0.1)",overflow:"hidden"}}><div style={{height:"100%",background:"linear-gradient(90deg,#d4af37,#f0d060)",animation:"loading 2s infinite",borderRadius:2}}/></div>
<p style={{fontFamily:G,fontSize:12,color:"rgba(232,213,163,0.25)"}}>This may take 2-5 minutes</p>
</div></div>);}

if(phase==="result"){const cs=gc();return(
<div style={bg}><style>{CSS}</style>
<div style={{...ctr,maxWidth:660}}>
<h2 style={{fontFamily:F,fontSize:24,color:"#d4af37",letterSpacing:4}}>Your Vision</h2>
<div style={{width:"100%",borderRadius:12,overflow:"hidden",border:"2px solid rgba(212,175,55,0.3)",boxShadow:"0 10px 50px rgba(212,175,55,0.15)"}}>
<video src={video} controls autoPlay loop playsInline style={{width:"100%",display:"block",background:"#000"}}/>
</div>
<div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap"}}>
{cs.map((c,i)=><div key={i} style={{textAlign:"center"}}><div style={{fontFamily:F,fontSize:10,color:"#d4af37",letterSpacing:2}}>{L[i]}</div><div style={{fontFamily:F,fontSize:12,color:"#e8d5a3"}}>{c.name}</div></div>)}
</div>
<div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
<a href={video} download target="_blank" rel="noreferrer" style={{fontFamily:F,fontSize:12,color:"#0a0514",background:"linear-gradient(135deg,#d4af37,#f0d060)",border:"none",borderRadius:8,padding:"12px 24px",textDecoration:"none",letterSpacing:2}}>DOWNLOAD</a>
<button onClick={start} style={{fontFamily:F,fontSize:12,color:"#d4af37",background:"transparent",border:"1px solid rgba(212,175,55,0.3)",borderRadius:8,padding:"12px 20px",cursor:"pointer",letterSpacing:2}}>NEW READING</button>
<button onClick={reset} style={{fontFamily:F,fontSize:12,color:"#d4af37",background:"transparent",border:"1px solid rgba(212,175,55,0.3)",borderRadius:8,padding:"12px 20px",cursor:"pointer",letterSpacing:2}}>HOME</button>
</div></div></div>);}
return null;}
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes loading{0%{width:0;margin-left:0}50%{width:60%;margin-left:20%}100%{width:0;margin-left:100%}}
@keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}
button:hover{filter:brightness(1.15)}`;
