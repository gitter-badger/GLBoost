import Shader from './Shader'
import SimpleShader from './SimpleShader'

export class LambertShaderSource {
  VSDefine_LambertShaderSource(in_, out_, f, lights) {
    var shaderText = '';
    if (Shader._exist(f, GLBoost.NORMAL)) {
      shaderText += `${in_} vec3 aVertex_normal;\n`;
      shaderText += `${out_} vec3 normal;\n`;
    }
    shaderText += `${out_} vec4 position;\n`;

    return shaderText;
  }

  VSTransform_LambertShaderSource(existCamera_f, f, lights) {
    var shaderText = '';
    shaderText += '  position = vec4(aVertex_position, 1.0);\n';
    shaderText += '  normal = aVertex_normal;\n';

    return shaderText;
  }

  FSDefine_LambertShaderSource(in_, f, lights) {
    var shaderText = '';
    if (Shader._exist(f, GLBoost.NORMAL)) {
      shaderText += `${in_} vec3 normal;\n`;
    }
    shaderText += `${in_} vec4 position;\n`;
    shaderText += `uniform vec4 lightPosition[${lights.length}];\n`;
    shaderText += `uniform vec4 lightDiffuse[${lights.length}];\n`;
    shaderText += `uniform vec4 Kd;\n`;

    return shaderText;
  }

  FSShade_LambertShaderSource(f, gl, lights) {
    var shaderText = '';

    shaderText += '  vec4 surfaceColor = rt1;\n';
    shaderText += '  rt1 = vec4(0.0, 0.0, 0.0, 0.0);\n';

    shaderText += `  for (int i=0; i<${lights.length}; i++) {\n`;
    // if PointLight: lightPosition[i].w === 1.0      if DirectionalLight: lightPosition[i].w === 0.0
    shaderText += '    vec3 light = normalize(lightPosition[i].xyz - position.xyz * lightPosition[i].w);\n';
    shaderText += '    float diffuse = max(dot(light, normal), 0.0);\n';
    shaderText += '    rt1 += Kd * lightDiffuse[i] * vec4(diffuse, diffuse, diffuse, 1.0) * surfaceColor;\n';
    shaderText += '  }\n';
    //shaderText += '  rt1.a = 1.0;\n';
    //shaderText += '  rt1 = vec4(position.xyz, 1.0);\n';


    return shaderText;
  }

  prepare_LambertShaderSource(gl, shaderProgram, vertexAttribs, existCamera_f, lights) {

    var vertexAttribsAsResult = [];
    vertexAttribs.forEach((attribName)=>{
      if (attribName === GLBoost.NORMAL) {
        shaderProgram['vertexAttribute_' + attribName] = gl.getAttribLocation(shaderProgram, 'aVertex_' + attribName);
        gl.enableVertexAttribArray(shaderProgram['vertexAttribute_' + attribName]);
        vertexAttribsAsResult.push(attribName);
      }
    });

    shaderProgram.Kd = gl.getUniformLocation(shaderProgram, 'Kd');

    lights = Shader.getDefaultPointLightIfNotExsist(gl, lights);

    for(let i=0; i<lights.length; i++) {
      shaderProgram['lightPosition_'+i] = gl.getUniformLocation(shaderProgram, `lightPosition[${i}]`);
      shaderProgram['lightDiffuse_'+i] = gl.getUniformLocation(shaderProgram, `lightDiffuse[${i}]`);
    }

    return vertexAttribsAsResult;
  }
}



export default class LambertShader extends SimpleShader {
  constructor(canvas) {

    super(canvas);
    LambertShader.mixin(LambertShaderSource);
  }

  setUniforms(gl, glslProgram, material) {
    super.setUniforms(gl, glslProgram, material);

    var Kd = material.diffuseColor;
    gl.uniform4f(glslProgram.Kd, Kd.x, Kd.y, Kd.z, Kd.w);
  }
}

GLBoost["LambertShader"] = LambertShader;
