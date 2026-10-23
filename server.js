import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
try {
  const envText = await readFile(path.join(root, '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
  }
} catch { /* .env is optional */ }
const port = Number(process.env.PORT || 3000);
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml' };
const schemes = [
  { id:'pmkisan', name:'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)', enName:'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)', kind:'farmer', tags:['किसान','खेती','फसल','बीज','खेती खर्च','पैसा','आर्थिक सहायता','kisan','farmer','farm','income','seed'], benefit:'पात्र किसान परिवार को ₹6,000 सालाना, तीन बराबर किस्तों में सीधे बैंक खाते में।', enBenefit:'Eligible farmer families receive ₹6,000 per year in three equal installments, directly into a bank account.', eligibility:'भूमि-धारक किसान परिवार; राज्य/केंद्रशासित प्रदेश पात्रता की पुष्टि करता है। संस्थागत भूमि-धारक और तय उच्च-आय/पद वाली कुछ श्रेणियाँ बाहर हैं।', enEligibility:'Landholding farmer families; the State/UT confirms eligibility. Institutional landholders and certain higher-income or public-office categories are excluded.', documents:'आधार, बैंक खाते का विवरण (खाता संख्या व IFSC), और राज्य के भूमि रिकॉर्ड से जुड़ी जानकारी तैयार रखें। सही सूची राज्य तय करता है।', enDocuments:'Keep Aadhaar, bank account details, and information linked to State land records ready. The State confirms the applicable requirements.', apply:'https://pmkisan.gov.in/', source:'https://pmkisan.gov.in/Documents/FAQPMKISAN.pdf', sourceLabel:'PM-KISAN आधिकारिक FAQ', enSourceLabel:'Official PM-KISAN FAQ', verified:'23 अक्तूबर 2026' },
  { id:'pmfby', name:'प्रधानमंत्री फसल बीमा योजना (PMFBY)', enName:'Pradhan Mantri Fasal Bima Yojana (PMFBY)', kind:'crop', tags:['फसल','नुकसान','ओला','सूखा','बाढ़','बारिश','बीमा','कीट','रोग','crop','insurance','damage','hail','drought','flood','rain'], benefit:'अधिसूचित फसल और क्षेत्र में अधिसूचित जोखिमों से फसल नुकसान पर बीमा सुरक्षा। किसान का अधिकतम प्रीमियम: खरीफ खाद्यान्न/तिलहन 2%, रबी 1.5%, वार्षिक वाणिज्यिक/बागवानी फसल 5% (बीमित राशि या बीमांकिक दर, जो कम हो)।', enBenefit:'Insurance protection for notified crop losses in notified areas. Farmer premium is capped at 2% for Kharif food crops/oilseeds, 1.5% for Rabi food crops/oilseeds, and 5% for annual commercial/horticultural crops (or the actuarial rate, whichever is lower).', eligibility:'अधिसूचित क्षेत्र में अधिसूचित फसल उगाने वाले किसान, जिनका फसल में बीमायोग्य हित हो। उपलब्धता और समय सीमा राज्य, जिला और फसल पर निर्भर करती है।', enEligibility:'Farmers with an insurable interest in a notified crop in a notified area. Availability and deadlines depend on State, district, and crop.', documents:'आधार/पहचान, बैंक खाते का विवरण, भूमि/किरायेदारी या फसल बोने का प्रमाण, और फसल/क्षेत्र की जानकारी तैयार रखें। स्थानीय अधिसूचना से सूची की पुष्टि करें।', enDocuments:'Keep identity, bank account details, proof of land/tenancy or sowing, and crop/area information ready. Confirm the list in the local notification.', apply:'https://pmfby.gov.in/', source:'https://pmfby.gov.in/faq', sourceLabel:'PMFBY आधिकारिक FAQ', enSourceLabel:'Official PMFBY FAQ', verified:'23 अक्तूबर 2026' },
  { id:'myscheme', name:'myScheme — सरकारी योजनाओं का खोज पोर्टल', enName:'myScheme — Government scheme discovery portal', kind:'discovery', tags:['योजना','सरकारी मदद','पता नहीं','दूसरी मदद','पेंशन','घर','पढ़ाई','स्वास्थ्य','महिला','रोजगार','scheme','help','pension','housing','education','health','women','job'], benefit:'केंद्र और राज्य की योजनाएँ ढूँढने और पात्रता की शुरुआती जानकारी पाने का एक सरकारी पोर्टल।', enBenefit:'An official portal to discover Central and State schemes and explore initial eligibility information.', eligibility:'उम्र, राज्य, आय और अन्य जानकारी के आधार पर योजनाएँ खोजें।', enEligibility:'Search for schemes using age, State, income, and other details.', documents:'पोर्टल पर पूछी गई जानकारी देखें; ज़रूरत योजना के अनुसार बदलती है।', enDocuments:'Check the information requested on the portal; requirements differ by scheme.', apply:'https://www.myscheme.gov.in/', source:'https://www.myscheme.gov.in/about', sourceLabel:'myScheme परिचय', enSourceLabel:'About myScheme', verified:'23 अक्तूबर 2026' }
];

const hi = {
  clarification: 'आपकी बात समझने में मदद के लिए एक छोटी जानकारी बताइए:',
  clarifications: [
    { test:t=>/फसल|नुकसान|crop|damage|बीमा|insurance/i.test(t), question:'आप कौन-सी फसल और किस राज्य/जिले में उगाते हैं?' },
    { test:t=>/किसान|खेती|पैसा|farmer|farm|income/i.test(t), question:'क्या खेती की जमीन परिवार के किसी सदस्य के नाम पर दर्ज है? अपना आधार या बैंक नंबर यहाँ न लिखें।' },
    { test:t=>/पेंशन|घर|पढ़ाई|स्वास्थ्य|महिला|रोजगार|scheme|help|job/i.test(t), question:'आप किस राज्य में रहते हैं और किस तरह की मदद खोज रहे हैं?' }
  ]
};

function recommendations(text) {
  const normalized = text.toLowerCase();
  const scores = schemes.map(s => ({ s, score:s.tags.reduce((n,tag)=>n+(normalized.includes(tag.toLowerCase())?1:0),0) }));
  scores.sort((a,b)=>b.score-a.score);
  const matches = scores.filter(x=>x.score>0 && x.s.id!=='myscheme').slice(0,2).map(x=>x.s);
  if (!matches.length || matches.length < 2) matches.push(schemes.find(s=>s.id==='myscheme'));
  return matches;
}

function fallback(text, language='hi') {
  if(language==='en') {
    const match = /crop|damage|insurance|hail|drought|flood|rain/i.test(text) ? 'Which crop do you grow, and in which State or district?' : /farmer|farm|income|seed/i.test(text) ? 'Is the farmland recorded in a family member’s name? Please don’t enter Aadhaar or bank numbers here.' : '';
    const found=recommendations(text), specific=found.some(s=>s.id!=='myscheme');
    return {mode:'demo',reply:match?`To guide you better, please tell me: ${match}`:specific?'Based on what you shared, these schemes may be worth exploring. Check the official details below and confirm eligibility for your situation.':'I need a little more detail to find a suitable scheme. Start with myScheme, or tell me your State and what kind of support you need. Please don’t enter Aadhaar or bank numbers.',ask:match||'',schemes:found};
  }
  const match = hi.clarifications.find(x=>x.test(text));
  const found = recommendations(text);
  const specific = found.some(s=>s.id!=='myscheme');
  return {
    mode:'demo',
    reply: match ? `${hi.clarification}\n${match.question}` : specific ? 'आपकी बात के आधार पर ये योजनाएँ देखने लायक हो सकती हैं। नीचे लाभ और आधिकारिक जानकारी देखें। पहले अपनी स्थिति के अनुसार पात्रता की पुष्टि ज़रूर करें।' : 'आपकी बात से अभी सही योजना पहचानना मुश्किल है। myScheme पर राज्य और ज़रूरत के अनुसार खोज शुरू करें। आप अपनी समस्या, राज्य और उम्र का मोटा अंदाज़ बता सकते हैं—आधार या बैंक नंबर न लिखें।',
    ask:match?.question || '',
    schemes:found
  };
}

async function advise(text, history=[], language='hi') {
  if (!process.env.GEMINI_API_KEY) return fallback(text,language);
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey:process.env.GEMINI_API_KEY });
    const candidates = recommendations(`${history.map(x=>x.content).join(' ')} ${text}`);
    const context = candidates.map(s=>({id:s.id,name:s.name,benefit:s.benefit,eligibility:s.eligibility,documents:s.documents,apply:s.apply,source:s.source}));
    const prompt = `${language==='hi'?'आप Scheme Saathi नाम के हिन्दी सहायता डेमो हैं। सरल, सम्मानजनक हिन्दी में जवाब दें।':'You are Scheme Saathi, a plain-language government-scheme guide. Reply in simple, respectful English.'} Do not invent scheme facts beyond the official data below. Use only the possible options listed. Do not guarantee eligibility. If key information such as State, need, or crop is missing, ask one short question and return an empty schemes list. Never claim that an application was submitted. Do not ask for identity numbers, Aadhaar, or bank details. Reply only as JSON: {"reply":"...","ask":"...","schemeIds":["..." ]}.\nOfficial options: ${JSON.stringify(context)}\nConversation: ${JSON.stringify([...history.slice(-5),{role:'user',content:text}])}`;
    const response = await ai.models.generateContent({ model:geminiModel, contents:prompt, config:{responseMimeType:'application/json'} });
    const parsed = JSON.parse(response.text);
    const chosen = candidates.filter(s=>(parsed.schemeIds||[]).includes(s.id));
    const ask = String(parsed.ask||'');
    return { mode:'ai', reply:String(parsed.reply||''), ask, schemes:ask ? [] : chosen.length ? chosen : candidates.filter(s=>s.id==='myscheme') };
  } catch (error) {
    console.error('Gemini request failed; using demo fallback:', error.message);
    return { ...fallback(text,language), error:language==='hi'?'AI अभी उपलब्ध नहीं है; डेमो जानकारी दिखाई जा रही है।':'AI is unavailable; showing demo information.' };
  }
}

const server = http.createServer(async (req,res)=>{
  if(req.method==='GET' && req.url==='/api/status'){
    res.writeHead(200,{'Content-Type':mime['.json'],'Cache-Control':'no-store'});
    res.end(JSON.stringify({aiConfigured:Boolean(process.env.GEMINI_API_KEY),model:geminiModel}));
    return;
  }
  if(req.method==='POST' && req.url==='/api/advice'){
    let body=''; req.on('data',chunk=>{ body+=chunk; if(body.length>20000) req.destroy(); });
    req.on('end',async()=>{ try { const input=JSON.parse(body); const text=String(input.message||'').trim().slice(0,1500); if(!text) throw new Error('खाली संदेश'); const result=await advise(text,Array.isArray(input.history)?input.history:[],input.language==='en'?'en':'hi'); res.writeHead(200,{'Content-Type':mime['.json'],'Cache-Control':'no-store'}); res.end(JSON.stringify(result)); } catch { res.writeHead(400,{'Content-Type':mime['.json']}); res.end(JSON.stringify({error:'कृपया अपना सवाल लिखें और फिर कोशिश करें।'})); } });
    return;
  }
  const requested = req.url==='/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(root,`.${requested}`);
  if(!file.startsWith(root)){ res.writeHead(403); res.end(); return; }
  try { const data=await readFile(file); res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}); res.end(data); }
  catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); res.end('Not found'); }
});
server.listen(port,()=>console.log(`Scheme Saathi is running at http://localhost:${port}`));
