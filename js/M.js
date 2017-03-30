
//////////////////////////////////////////////////////////////////////////////
// M is an object containing methods that let you manipulate 4x4 matrices.
//////////////////////////////////////////////////////////////////////////////

var M = {};

//////////////////////////////////////////////////////////////////////////////
// Your task is to implement the following methods of object M:
//////////////////////////////////////////////////////////////////////////////

M.identity  = function(m)          {           } // Set m values to identity matrix.
M.restore   = function(m)          {           } // Pop from a stack to set the 16 values of m.
M.rotateX   = function(m, radians) {           } // Modify m, rotating about the X axis.
M.rotateY   = function(m, radians) {           } // Modify m, rotating about the Y axis.
M.rotateZ   = function(m, radians) {           } // Modify m, rotating about the Z axis.
M.save      = function(m)          {           } // Push the 16 values of m onto a stack.
M.scale     = function(m, v)       {           } // Modify m, scaling by v[0],v[1],v[2].
M.transform = function(m, v)       { return m; } // Return vec v transformed by matrix m.
M.translate = function(m, v)       {           } // Modify m, translating by v[0],v[1],v[2].

//////////////////////////////////////////////////////////////////////////////
// I have given you a head start by implementing some of the methods for you.
//
// Notice how I use M.matrixMultiply() to help implement other methods.
//////////////////////////////////////////////////////////////////////////////


M.identity = function(m){
  var result = m;
  var size = Math.sqrt(result.length);
  for (let i = 0; i < size; i++){
    for (let j = 0; j < size; j++){
      if (i === j){
        result[i*size+j] = 1; 
      }
      else{
        result[i*size+j] = 0;
      }
    }
  }
  return result;
}


M_stack = [];

M.save = function(m) {
   var i, _m = [];
   for (i = 0 ; i < m.length ; i++)
      _m.push(m[i]);                 // MAKE A COPY OF MATRIX
   M_stack.push(_m);                // PUSH IT ONTO THE STACK
}
M.restore = function(m) {
   var i, _m = M_stack.pop();       // POP THE COPY OFF THE STACK
   for (i = 0 ; i < m.length ; i++)  // COPY ITS VALUES INTO MATRIX
      m[i] = _m[i];
}


M.rotateX = function(m, radians){
  var s = Math.sin(radians);
  var c = Math.cos(radians);
  m10 = m[4],
  m11 = m[5],
  m12 = m[6],
  m13 = m[7],
  m20 = m[8],
  m21 = m[9],
  m22 = m[10],
  m23 = m[11];

  m[4] = m10 * c + m20 * s;
  m[5] = m11 * c + m21 * s;
  m[6] = m12 * c + m22 * s;
  m[7] = m13 * c + m23 * s;
  m[8] = m20 * c - m10 * s;
  m[9] = m21 * c - m11 * s;
  m[10] = m22 * c - m12 * s;
  m[11] = m23 * c - m13 * s;





}

M.rotateY = function(m, radians){
  var s = Math.sin(radians);
  var c = Math.cos(radians);
  m00 = m[0],
  m01 = m[1],
  m02 = m[2],
  m03 = m[3],
  m20 = m[8],
  m21 = m[9],
  m22 = m[10],
  m23 = m[11];


  m[0] = m00 * c - m20 * s;
  m[1] = m01 * c - m21 * s;
  m[2] = m02 * c - m22 * s;
  m[3] = m03 * c - m23 * s;
  m[8] = m00 * s + m20 * c;
  m[9] = m01 * s + m21 * c;
  m[10] = m02 * s + m22 * c;
  m[11] = m03 * s + m23 * c;
}

M.rotateZ = function(m, radians){
  var s = Math.sin(radians);
  var c = Math.cos(radians);
  m00 = m[0],
  m01 = m[1],
  m02 = m[2],
  m03 = m[3],
  m10 = m[4],
  m11 = m[5],
  m12 = m[6],
  m13 = m[7];

  m[0] = m00 * c + m10 * s;
  m[1] = m01 * c + m11 * s;
  m[2] = m02 * c + m12 * s;
  m[3] = m03 * c + m13 * s;
  m[4] = m10 * c - m00 * s;
  m[5] = m11 * c - m01 * s;
  m[6] = m12 * c - m02 * s;
  m[7] = m13 * c - m03 * s;



}


M.scale = function(m,v){
  var x,y,z;
  if (v instanceof Array){
    x = v[0];
    y = v[1];
    z = v[2];

  }
  else{
    x = y = z = v;
  }
 m[0] *= x;
 m[1] *= x;
 m[2] *= x;
 m[3] *= x;
 m[4] *= y;
 m[5] *= y;
 m[6] *= y;
 m[7] *= y;
 m[8] *= z;
 m[9] *= z;
 m[10] *= z;
 m[11] *= z;



}




M.translate = function(m, v) {
 M.matrixMultiply(m, M.translationMatrix(v), m);
}

M.translationMatrix = function(v) {
 return [ 1,0,0,0, 0,1,0,0, 0,0,1,0, v[0],v[1],v[2],1 ];
}

M.matrixMultiply = function(a, b, dst) {
 var n, tmp = []; 

   // PUT THE RESULT OF a x b INTO TEMPORARY MATRIX tmp.

   for (n = 0 ; n < 16 ; n++)
    tmp.push( a[n&3     ] * b[    n&12] +
      a[n&3 |  4] * b[1 | n&12] +
      a[n&3 |  8] * b[2 | n&12] +
      a[n&3 | 12] * b[3 | n&12] );

   // COPY tmp VALUES INTO DESTINATION MATRIX dst.

   for (n = 0 ; n < 16 ; n++)
    dst[n] = tmp[n];
}

M.transform = function(m, v)  {

    // IF v[3] IS UNDEFINED, SET IT TO 1 (THAT IS, ASSUME v IS A POINT).

    var x = v[0], y = v[1], z = v[2], w = v[3] === undefined ? 1 : v[3];

    // RETURN RESULT OF TRANSFORMING v BY MATRIX m.

    return [ x * m[0] + y * m[4] + z * m[ 8] + w * m[12],
    x * m[1] + y * m[5] + z * m[ 9] + w * m[13],
    x * m[2] + y * m[6] + z * m[10] + w * m[14],
    x * m[3] + y * m[7] + z * m[11] + w * m[15] ];
  }

