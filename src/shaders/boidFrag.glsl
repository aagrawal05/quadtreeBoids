#version 460

layout(location = 0) out vec4 f_color;

void main() {

	/* vec2 uv = gl_FragCoord.xy / vec2(800, 600); */
	/* if (distance(uv, vec2(0.5)) > 0.5) { */
	/* 	discard; */
	/* } */

	f_color = vec4(1, 0, 0, 1);
}
