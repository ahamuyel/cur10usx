"use client"

import { useEffect, useRef } from 'react'

const vsSource = `attribute vec4 aVertexPosition;void main(){gl_Position=aVertexPosition;}`

const fsSource = `precision highp float;uniform vec2 iR;uniform float iT;
const float S=0.2,AW=0.05,MLW=0.025,mLW=0.0125,MLF=5.0,mLF=1.0,SC=5.0;
const vec4 LC=vec4(0.4,0.2,0.8,1.0);
float rnd(float t){return(cos(t)+cos(t*1.3+1.3)+cos(t*1.4+1.4))/3.0;}
void main(){
  vec2 uv=gl_FragCoord.xy/iR.xy;
  vec2 sp=(gl_FragCoord.xy-iR.xy/2.0)/iR.x*2.0*SC;
  float hF=1.0-(cos(uv.x*6.28)*0.5+0.5);
  float vF=1.0-(cos(uv.y*6.28)*0.5+0.5);
  sp.y+=rnd(sp.x*0.5+iT*S*0.2)*1.0*(0.5+hF);
  sp.x+=rnd(sp.y*0.5+iT*S*0.2+2.0)*1.0*hF;
  vec4 F=vec4(0.0);
  vec4 B1=vec4(0.1,0.1,0.3,1.0),B2=vec4(0.3,0.1,0.5,1.0);
  for(int l=0;l<16;l++){
    float nI=float(l)/16.0;
    float oT=iT*S*1.33;
    float oP=float(l)+sp.x*0.5;
    float rd=rnd(oP+oT)*0.5+0.5;
    float hW=mix(0.01,0.2,rd*hF)/2.0;
    float oF=rnd(oP+oT*(1.0+nI))*mix(0.6,2.0,hF);
    float lY=rnd(sp.x*0.2+iT*S)*hF*1.0+oF;
    float ln=smoothstep(hW,0.0,abs(lY-sp.y))/2.0+smoothstep(hW*0.15+0.015,hW*0.15,abs(lY-sp.y));
    float cX=mod(float(l)+iT*S,25.0)-12.0;
    float cY=rnd(cX*0.2+iT*S)*hF*1.0+oF;
    float cc=smoothstep(0.01+0.015,0.01,length(vec2(cX,cY)-sp))*4.0;
    F+=(ln+cc)*LC*rd;
  }
  gl_FragColor=mix(B1,B2,uv.x)*vF+F;
  gl_FragColor.a=1.0;
}`

const ShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    const vs = gl.createShader(gl.VERTEX_SHADER)
    if (!vs) return
    gl.shaderSource(vs, vsSource)
    gl.compileShader(vs)
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) { gl.deleteShader(vs); return }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fs) return
    gl.shaderSource(fs, fsSource)
    gl.compileShader(fs)
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { gl.deleteShader(fs); return }

    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl.deleteProgram(prog); return }

    const buf = gl.createBuffer()
    if (!buf) return
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(prog, 'aVertexPosition')
    const resLoc = gl.getUniformLocation(prog, 'iR')
    const timeLoc = gl.getUniformLocation(prog, 'iT')

    let animId = 0
    const startTime = performance.now()

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const w = parent.clientWidth || window.innerWidth
      const h = parent.clientHeight || window.innerHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
    }

    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    const draw = () => {
      gl.clearColor(0, 0, 0, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(prog)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.uniform1f(timeLoc, (performance.now() - startTime) / 1000)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(posLoc)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

export default ShaderBackground
