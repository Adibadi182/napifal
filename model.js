export const repeats = {once:'Csak ma',daily:'Minden nap',weekdays:'Hétfő–péntek',weekends:'Hétvégén',weekly:'Hetente'};
export const dayKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function appliesOn(t,d){const n=d.getDay();switch(t.repeat){case 'once':return t.createdDay===dayKey(d);case 'daily':return true;case 'weekdays':return n>=1&&n<=5;case 'weekends':return n===0||n===6;case 'weekly':return n===t.weeklyDay;default:return false;}}
export const hasTime = t => Number.isInteger(t.hour)&&t.hour>=0&&t.hour<24&&Number.isInteger(t.minute)&&t.minute>=0&&t.minute<60;
export const timeOrder = t => hasTime(t)?t.hour*60+t.minute:1440;
export const timeLabel = t => hasTime(t)?`${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`:'';
export const emptyData = () => ({tasks:[],completed:{},photos:[]});
// Reject incomplete or malformed backups before touching the current database.
export function validateData(d){
  if(!d||!Array.isArray(d.tasks)||!Array.isArray(d.photos)||!d.completed||Array.isArray(d.completed)||typeof d.completed!=='object')throw Error('Ez nem teljes NapiFal-mentés.');
  if(d.tasks.length>10000||d.photos.length>1000)throw Error('Túl nagy mentés.');
  const ids=new Set();
  for(const t of d.tasks){if(!t||typeof t.id!=='string'||!t.id||ids.has(t.id)||typeof t.title!=='string'||!t.title.trim()||t.title.length>120||!Object.hasOwn(repeats,t.repeat)||!/^\d{4}-\d{2}-\d{2}$/.test(t.createdDay)||!Number.isInteger(t.weeklyDay)||t.weeklyDay<0||t.weeklyDay>6)throw Error('Hibás feladat a mentésben.');ids.add(t.id);if((t.hour!=null||t.minute!=null)&&!hasTime(t))throw Error('Hibás időpont a mentésben.');}
  for(const [key,values] of Object.entries(d.completed)){if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!Array.isArray(values)||values.some(v=>typeof v!=='string'))throw Error('Hibás napi jelölések.');}
  ids.clear();for(const p of d.photos){if(!p||typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.caption!=='string'||p.caption.length>60||![p.x,p.y,p.rotation].every(Number.isFinite)||typeof p.dataUrl!=='string'||!/^data:image\/(jpeg|png|webp|gif|heic|heif);base64,[A-Za-z0-9+/=\r\n]+$/.test(p.dataUrl))throw Error('Hiányzó vagy hibás fotó a mentésben. Az Expo JSON önmagában nem tartalmaz képfájlokat.');ids.add(p.id);}
  return {tasks:d.tasks.map(t=>({...t})),completed:Object.fromEntries(Object.entries(d.completed).map(([k,v])=>[k,[...v]])),photos:d.photos.map(p=>({...p}))};
}
