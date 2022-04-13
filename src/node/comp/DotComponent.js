import "@babel/polyfill";
import NodeComponent from "../NodeComponent";
import NumControl from "../control/NumControl";
import Vec2Control from "../control/Vec2Control";
import Vec3Control from "../control/Vec3Control";
import Vec4Control from "../control/Vec4Control";

import { methods } from "../compile/PredefinedMethod";
import { Method } from "../compile/DataDefine";

import {MethodTemplateComponent, MethodsList} from "./MethodTemplateComponent"

var dotComponent = new MethodTemplateComponent('Dot Product',
    new MethodsList(methods['dot'],'Number',{'a':'Vector','b':'Vector'},['a','b']));
export {dotComponent}