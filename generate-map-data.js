const fs=require('fs');
const source=JSON.parse(fs.readFileSync('public/cameroon-adm1.geojson','utf8'));
const project=(lon,lat)=>[200+(lon-8.49)*40,15+(13.1-lat)*32.5];
function simplify(points,tolerance=.035){if(points.length<3)return points;const sq=tolerance*tolerance;const dist=(p,a,b)=>{let x=a[0],y=a[1],dx=b[0]-x,dy=b[1]-y;if(dx||dy){const t=((p[0]-x)*dx+(p[1]-y)*dy)/(dx*dx+dy*dy);if(t>1){x=b[0];y=b[1]}else if(t>0){x+=dx*t;y+=dy*t}}dx=p[0]-x;dy=p[1]-y;return dx*dx+dy*dy};const walk=(pts)=>{let max=sq,index=0;for(let i=1;i<pts.length-1;i++){const d=dist(pts[i],pts[0],pts[pts.length-1]);if(d>max){index=i;max=d}}if(max>sq){const a=walk(pts.slice(0,index+1)),b=walk(pts.slice(index));return a.slice(0,-1).concat(b)}return[pts[0],pts[pts.length-1]]};return walk(points)}
const path=(ring)=>simplify(ring).map((p,i)=>{const [x,y]=project(p[0],p[1]);return`${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`}).join(' ')+'Z';
const regions=source.features.map(f=>({name:f.properties.shapeName,paths:f.geometry.type==='Polygon'?f.geometry.coordinates.map(path):f.geometry.coordinates.flatMap(p=>p.map(path))}));
fs.writeFileSync('cameroon-map-data.js',`window.CAMEROON_REGIONS=${JSON.stringify(regions)};\n`);
console.log(`Generated ${regions.length} regions`);
