var noise_shader = [
,'   vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }'
,'   vec4 mod289(vec4 x) { return x - floor(x * (1. / 289.)) * 289.; }'
,'   vec4 permute(vec4 x) { return mod289(((x*34.)+1.)*x); }'
,'   vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - .85373472095314 * r; }'
,'   vec3 fade(vec3 t) { return t*t*t*(t*(t*6.-15.)+10.); }'
,'   float noise(vec3 P) {'
,'      vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.)),'
,'           f0 = fract(P), f1 = f0 - vec3(1.), f = fade(f0);'
,'      vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy),'
,'           iz0 = i0.zzzz, iz1 = i1.zzzz,'
,'           ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1),'
,'           gx0 = ixy0 * (1. / 7.), gy0 = fract(floor(gx0) * (1. / 7.)) - .5,'
,'           gx1 = ixy1 * (1. / 7.), gy1 = fract(floor(gx1) * (1. / 7.)) - .5;'
,'      gx0 = fract(gx0); gx1 = fract(gx1);'
,'      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.)),'
,'           gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.));'
,'      gx0 -= sz0 * (step(0., gx0) - .5); gy0 -= sz0 * (step(0., gy0) - .5);'
,'      gx1 -= sz1 * (step(0., gx1) - .5); gy1 -= sz1 * (step(0., gy1) - .5);'
,'      vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),'
,'           g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),'
,'           g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),'
,'           g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);'
,'      vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3))),'
,'           norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));'
,'      g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;'
,'      g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;'
,'      vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),'
,'                         dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),'
,'                    vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),'
,'                         dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);'
,'      return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);'
,'   }'
,'   float turbulence(vec3 P) {'              // Turbulence is a fractal sum of abs(noise).
,'      float f = 0., s = 1.;'                // The domain is rotated after every iteration
,'      for (int i = 0 ; i < 9 ; i++) {'      //    to avoid any visible grid artifacts.
,'         f += abs(noise(s * P)) / s;'
,'         s *= 2.;'
,'         P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);'
,'      }'
,'      return f;'
,'   }'
,''
].join('\n');

function isChrome() {
   return navigator.userAgent.toLowerCase().indexOf('chrome/') > -1
}

var fragmentShaderHeader = [''               // SHADER HEADER
,'   precision highp float;'
,''
].join('\n');

var _fragmentShaderCodeToInsert ='';

function insertFragmentShaderCode(code) {
    _fragmentShaderCodeToInsert += code;
}



var uniformData = {};

function declareUniform(name, type, size) {
   uniformData[name] = {type:type, size:size};
}

function setUniform(name, data) {
   uniformData[name].data = data;
}

function gl_start(canvas, vertexShader, update) {           // START WEBGL RUNNING IN A CANVAS
    

   gl_vertexShader = vertexShader;
   fragmentShader = textArea.fss[1];

   for (var name in uniformData) {
      let u = uniformData[name];
      fragmentShaderHeader += '#define ' + name + '_length ' + u.size + '\n' +
                              '   uniform ' + u.type + ' ' + name + (u.size > 0 ? '[' + u.size + ']' : '') + ';\n';
   }
    fragmentShaderHeader += _fragmentShaderCodeToInsert;

   setTimeout(function() {
      try { 
         canvas.gl = canvas.getContext('experimental-webgl');                 // Make sure WebGl is supported.
      } catch (e) { throw 'Sorry, your browser does not support WebGL.'; }

      canvas.setFragmentShader = function(fragmentShader) {
         this.setShaders(gl_vertexShader, fragmentShader);
      }

      function address(name) { var gl = canvas.gl; return gl.getUniformLocation(gl.program, name); }

      canvas.setShaders = function(vertexShader, fragmentShader) {            // Add the vertex and fragment shaders:
         var gl = this.gl, program = gl.createProgram();                           // Create the WebGL program.
	 gl.program = program;
         var shaderError = '';
	 errorLineNumber = -1;

         function addshader(type, src) {                                           // Create and attach a WebGL shader.
            var shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	       shaderError = gl.getShaderInfoLog(shader);
               console.log('Cannot compile shader:\n\n' + shaderError);
            }
            gl.attachShader(program, shader);
         };

         addshader(gl.VERTEX_SHADER  , vertexShader  );                            // Add the vertex and fragment shaders.
         addshader(gl.FRAGMENT_SHADER, fragmentShaderHeader + fragmentShader);

         gl.linkProgram(program);                                                  // Link the program and report any errors.
         if (! gl.getProgramParameter(program, gl.LINK_STATUS))
            console.log('Could not link the shader program!');

         else {
            gl.useProgram(program);

            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());                        // Create a square as a triangle strip
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(                          //    consisting of two triangles.
                          [ -1,1,0, 1,1,0, -1,-1,0, 1,-1,0 ]), gl.STATIC_DRAW);

            var aPos = gl.getAttribLocation(program, 'aPos');                         // Assign aPos attribute to each vertex.
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
         }

	 textArea.style.color = shaderError.length == 0 ? 'white' : '#ffffa0';
	 if (shaderError.length == 0)
	    errorMessage.innerHTML = '';
         else {
	    var message = shaderError.substring(9, shaderError.length);
	    errorLineNumber = parseInt(message) - 2;
	    message = message.substring(message.indexOf(' '), message.length);
	    var nE = message.indexOf('ERROR');
	    if (nE > 0)
	       message = message.substring(0, nE);
	    errorMessage.innerHTML = '<font face=courier>'
	                           + message.substring(0, Math.min(60, message.length))
				   + '</font>';
	 }
         highlight.setHighlight(highlightPattern);

      }

      canvas.setShaders(vertexShader, fragmentShader);                        // Initialize everything,

      setInterval(function() {                                                // Start the animation loop.
         time = (Date.now() - _startTime) / 1000;
         var gl = canvas.gl;
         gl.uniform1f(address('uTime'), time);                                // Set time for the shaders.

	 update();

         for (var name in uniformData) {
	    let u = uniformData[name];
	    switch (u.type) {
	    case 'float': gl.uniform1fv(address(name), u.data); break;
	    case 'vec2' : gl.uniform2fv(address(name), u.data); break;
	    case 'vec3' : gl.uniform3fv(address(name), u.data); break;
	    case 'vec4' : gl.uniform4fv(address(name), u.data); break;
	    }
	 }

         gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);                                   // Render the square.
      }, 30);

   }, 100); // Wait 100 milliseconds after page has loaded before starting WebGL.
}

var _startTime = Date.now(), time = 0;
var errorLineNumber = -1;
var highlightPattern = '  ';
var index = 0;
function prevIndex() { setIndex(index - 3); }
function nextIndex() { setIndex(index + 3); }

function setIndex(i) {
   var fss = textArea.fss;
   index = Math.max(0, Math.min(fss.length - 3, i));
   highlightPattern = fss[index];
   textArea.setCode(fss[index + 1]);
   narrative.innerHTML = fss[index + 2];
   prevButton.style.background = index == 0 ? 'black' : accentColor(true); 
   nextButton.style.background = index == fss.length - 3 ? 'black' : accentColor(true);
   canvas1.setShaders(gl_vertexShader, fss[index + 1], fss[index + 2]);
   for (i = 0 ; i < fss.length ; i += 3)
      window['indexButton' + i].style.background = accentColor(i == index);
}  

function accentColor(isTrue) { return isTrue ? '#aaddff' : '#006080'; }

function addTextEditor(fss, callback) {                      // Add a text editor to the web page:
   highlightPattern = fss[0];
   var code         = fss[1];
   var narrative    = fss[2];

   function createIndexButtons() {
      var str = '';
      for (var i = 0 ; i < fss.length ; i += 3)
         str += '<button id=indexButton' + i + ' onclick="setIndex(' + i + ')" '
	        + 'style="color:black;background:' + accentColor(i==0) + ';border-style:none;outline-width:0">'
		+ '<b>' + String.fromCharCode(65 + Math.floor(i / 3)) + '</b>'
		+ '</button> &nbsp;'
      return str;
   }

   document.body.innerHTML = [''

      ,'<CENTER>'
      ,'<TABLE cellspacing=0 cellpadding=0 >'
      ,'<TR>'

      ,'<TD valign=top>'

      ,    '<TABLE cellspacing=0 cellpadding=0>'

      ,    '<TR>'
      ,    '<TD>'
      ,    '</TD>'
      ,    '<TD>'
      ,        createIndexButtons()
      ,    '</TD>'
      ,    '</TR>'

      ,    '<TR>'
      ,    '<TD>&nbsp;</TD>'
      ,    '<TD><font color=#ff9090><text id=errorMessage> </text></font></TD>'
      ,    '</TR>'

      ,    '<TR>'
      ,    '<TD valign=top>'
      ,        '<text id=highlight></text>'
      ,    '</TD>'

      ,    '<TD valign=top>'
      ,        '<table>'

      ,        '<tr>'
      ,        '<td width=100%>'
      ,            '<button id=prevButton style="color:black;background:black;border-style:none;outline-width:0">'
      ,                '<big><b><big>&larr;</big> PREV</b></big>'
      ,            '</button>'

      ,            '&nbsp;'

      ,            '<button id=nextButton style="color:black;background:' + accentColor(true) + ';border-style:none;outline-width:0">'
      ,                '<big><b>NEXT <big>&rarr;</big></b></big>'
      ,            '</button>'
      ,        '</td>'
      ,        '</tr>'

      ,        '<tr>'
      ,        '<td>'
      ,            '<textArea id=textArea '
      ,            'style="background:black;color:white;font:13px courier;outline-width:0;border-style:none;resize:none;overflow:scroll">'
      ,            '</textArea>'
      ,        '</td>'
      ,        '</tr>'

      ,        '</table>'
      ,    '</TD>'
      ,    '</TR>'

      ,    '</TABLE>'

      ,'</TD>'

      ,'<TD valign=top>'
      ,    '<table>'

      ,    '<tr><td valign=top>'
      ,    document.body.innerHTML
      ,    '</td></tr>'

      ,    '<tr><td valign=top>'
      ,       '<pre><font color=' + accentColor(true) + ' face=helvetica><big><text id=narrative>'
      ,          narrative
      ,       '</text></font><pre>'
      ,    '</td></tr>'

      ,    '</table>'
      ,'</TD>'

      ,'</TR>'
      ,'</TABLE>'
      ,'</CENTER>'

   ].join('');

   prevButton.onclick = prevIndex;
   nextButton.onclick = nextIndex;
   highlight.style.color = accentColor(true);

   highlight.setHighlight = function(hlight) {
      while (hlight.length <= errorLineNumber)
         hlight += ' ';
      var str = '', i;
      for (i = 0 ; i < hlight.length ; i++)
         str += ( i == errorLineNumber ? '<font color=#ff8090>&block;&block;</font>' :
	          hlight.charCodeAt(i) > 32 ? '&block;&block;' : '  ' ) + '\n';
      this.innerHTML = '<font size=3><hr size=' + (isChrome() ? 10 : 15) + ' color=black><pre>' + str + '</pre>';
   }

   highlight.setHighlight(highlightPattern);

   textArea.setCode = function(code) {
      this.value = code;

      var i = 0, text = this.value.split('\n');                             // Set the correct number of rows and columns.
      this.rows = text.length;
      while (i < text.length)
         this.cols = Math.max(this.cols, text[i++].length);
   }

   textArea.fss = fss;
   textArea.setCode(code);
   textArea.onkeyup = callback;                                              // User-provided callback function on keystroke.
}

