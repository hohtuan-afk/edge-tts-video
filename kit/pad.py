import numpy as np, wave, sys
SR=48000; dur=float(sys.argv[1]); out=sys.argv[2]
t=np.arange(int(SR*dur))/SR
# Am - F - C - G, 8 s mỗi hợp âm, âm nền dịu
chords=[[220,261.63,329.63],[174.61,220,261.63],[196,261.63,329.63],[196,246.94,293.66]]
sig=np.zeros_like(t); L=8.0
for k in range(int(dur//L)+2):
    st=k*L; ch=chords[k%4]
    m=(t>=st-2)&(t<st+L+2)
    tt=t[m]-st
    env=np.clip((tt+2)/3,0,1)*np.clip((L+2-tt)/3,0,1)
    for f in ch+[ch[0]/2]:
        for h,a in [(1,1),(2,.25),(3,.08)]:
            sig[m]+=a*env*np.sin(2*np.pi*f*h*tt+ k)*(1+0.15*np.sin(2*np.pi*0.2*tt))
sig/=np.abs(sig).max()
fade=np.clip(t/3,0,1)*np.clip((dur-t)/4,0,1)
sig=sig*fade*0.6
st=np.stack([sig,np.roll(sig,int(0.012*SR))],1)
with wave.open(out,'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((st*32767).astype(np.int16).tobytes())
