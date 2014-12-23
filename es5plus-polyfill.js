/*!
 * @description polyfill features of ES5
 * @module basic features
 * @author fsjohnhuang
 * @version v0.1
 */
;(function(){
	// ES5
	var _IsNotAFunctionError = function(){
		this.message = 'is not a function';
	};
	_IsNotAFunctionError.prototype = TypeError.prototype;

	/**
	 * String
	 * refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/anchor
	 */
	String.prototype.trim = String.prototype.trim
		|| function(){
			return this.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
		};

	/**
	 * Function
	 */
	if (!Function.prototype.bind){
		var _bound = function(){
				// 对new一元运算符进行处理
	 			if (this instanceof _bound){
	 				var ctor = function(){};
	 				ctor.prototype = fn.prototype;
	 				var self = new ctor();
	 				fn.apply(self, presetArgs.concat([].slice.call(arguments)));
	 				return self;
	 			}
	 			return fn.apply(context, presetArgs.concat([].slice.call(arguments)));
			};
		var	_boundStr = _bound.toString();	
		var boundCache = {}; // 缓存

		Function.prototype.bind = function(){
	 		var fn = this, presetArgs = [].slice.call(arguments);
	 		var context = presetArgs.shift();

	 		// 设置已绑定的函数的length属性，否则返回默认值0
	 		// 保持已绑定的函数的形参与原版函数的形参对应
	 		var strOfThis = fn.toString();
	 		var cacheKey = strOfThis + ',' + presetArgs.length;
	 		if (!boundCache[cacheKey]){
		 		var fpsOfThis = /^function[^()]*\((.*?)\)/i.exec(strOfThis)[1].trim().split(',');
		 		var lengthOfBound = Math.max(fn.length - presetArgs.length, 0);
		 		var boundArgs = lengthOfBound && fpsOfThis.slice(presetArgs.length) || [];
		 		// 由于函数的length属性不可重新赋值(特性writable:false)，所以需通过动态定义函数的方式定义bound
		 		// 1. new Function(arg1,arg2,...,fnBody)的VariableObject和this都指向Global Object，因此无法正确调用fn.apply(context,.......)
		 		// 2. eval在函数内调用时，VariableObject指向所属函数的VariableObject，因此使用eval动态定义函数
		 		boundCache[cacheKey] = eval('(0, ' + _boundStr.replace('function()', 'function(' + boundArgs.join(',') + ')') + ')');
		 	}

	 		return boundCache[cacheKey];
	 	};
	 }

	/**
	 * Array
	 */
	Array.isArray = Array.isArray
	 	|| function(obj){
	 		return ({}.toString.call(obj)) === '[object Array]';
	 	};

	Array.prototype.indexOf = 	Array.prototype.indexOf
	 	|| function(item, startIndex){
	 		if (arguments.length === 0 || startIndex && startIndex >= this.length) return -1;

	 		var _startIndex = Number(startIndex);
	 		for (var len = this.length, i = _startIndex && (len + _startIndex) % len || 0; i < len; ++i){
	 			if (this[i] === item) return i;
	 		}
	 		return -1;
	 	};

	Array.prototype.lastIndexOf = Array.prototype.lastIndexOf
	 	|| function(item, startIndex){
	 		if (arguments.length === 0) return -1;

	 		var len = this.length, i;
	 		if (arguments.length === 1){
	 			i = len - 1;
	 		}
	 		else{
		 		var _startIndex = Number(startIndex);
		 		i = isNaN(_startIndex) ? 0 : _startIndex > len ? len - 1 : (len + _startIndex) % len;
	 		}
	 		for (; i >= 0; --i){
	 			if (this[i] === item) return i;
	 		}	
	 		return -1;
	 	};

	Array.prototype.forEach = Array.prototype.forEach
	 	|| function(fn, context){
	 		if (typeof fn !== 'function') throw new _IsNotAFunctionError();

	 		for (var i = 0, len = this.length; i < len; ++i) {
	 			fn.call(context, this[i], i, this);
	 		}
	 	};

	Array.prototype.map = Array.prototype.map
	 	|| function(fn, context){
	 		if (typeof fn !== 'function') throw new _IsNotAFunctionError();

	 		var ret = [];	 		
	 		for (var i = 0, len = this.length; i < len; ++i) {
	 			ret.push(fn.call(context, this[i], i, this));
	 		}
	 		return ret;
	 	};

	Array.prototype.filter = Array.prototype.filter	
	 	|| function(fn, context){
	 		if (typeof fn !== 'function') throw new _IsNotAFunctionError();

	 		var ret = [];
	 		for (var i = 0, len = this.length; i < len; ++i) {
	 			fn.call(context, this[i], i, this) && ret.push(this[i]);
	 		}
	 		return ret;
	 	};

	Array.prototype.some = Array.prototype.some
		|| function(fn, context){
	 		if (typeof fn !== 'function') throw new _IsNotAFunctionError();

			var ret = false;
	 		for (var i = 0, len = this.length; i < len && !ret; ++i) {
	 			ret = ret || fn.call(context, this[i], i, this);
	 		}
	 		return ret;
		};	

	Array.prototype.every = Array.prototype.every	
		|| function(fn, context){
	 		if (typeof fn !== 'function') throw new _IsNotAFunctionError();

	 		var ret = true;
	 		for (var i = 0, len = this.length; i < len && ret; ++i) {
	 			ret = ret && fn.call(context, this[i], i, this);
	 		}
	 		return ret;
		};

	Array.prototype.reduce = Array.prototype.reduce	
		|| function(fn, initialValue){
			if (typeof fn !== 'function') throw new _IsNotAFunctionError();
			if (!this.length && initialValue === void 0) throw new TypeError('Reduce of empty array with no initial value');
			if (!this.length && initialValue !== void 0) return initialValue;

			var hasInitialValue = initialValue !== void 0
				, ret = hasInitialValue ? initialValue : this[0]
				, i = hasInitialValue ? 0 : 1;
			for (len = this.length; i < len; ++i) {
				ret = fn.call(null, ret, this[i], i, this);
			}
			return ret;
		};

	Array.prototype.reduceRight = Array.prototype.reduceRight
		|| function(fn, initialValue){
			if (typeof fn !== 'function') throw new _IsNotAFunctionError();
			if (!this.length && initialValue === void 0) throw new TypeError('Reduce of empty array with no initial value');
			if (!this.length && initialValue !== void 0) return initialValue;

			var hasInitialValue = initialValue !== void 0
				, ret = hasInitialValue ? initialValue : this[this.length - 1];
			for (var i = this.length - (hasInitialValue ? 1 : 2); i >= 0; --i) {
				ret = fn.call(null, ret, this[i], i, this);
			}
			return ret;
		};


	/**
	 * Date
	 */
	if (!Date.prototype.toISOString){
		var isLeapYear = function(year){
			return (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
		};
		var operHoursAndMinutes = {}; 
		operHoursAndMinutes['+'] = function(minusHours, minusMinutes, year, month, date, hours, minutes, seconds, milliseconds){
			var ret = {};
			minutes -= minusMinutes;
			hours -= minusHours;
			if (minutes < 0){
				hours -= 1;
				minutes += 60;
			}
			if (hours < 0 ){
				--date;
				hours += 24;
				if (date < 0){
					--month;
					if (month < 0){
						--year;
						month = 11;
					}
					if (month % 2 === 0){
						date += 31;	
					}
					else if (month === 1)
					{
						date += isLeapYear(year) ? 29 : 28;
					}
					else{
						date += 30;
					}

					if (month < 0){
						--year;
						month += 12;
					}
				}
			}

			ret.year = year;
			ret.month = month;
			ret.date = date;
			ret.hours = hours;
			ret.minutes = minutes;
			ret.seconds = seconds;
			ret.milliseconds = milliseconds;

			return ret;
		};
		operHoursAndMinutes['-'] = function(addHours, addMinutes, year, month, date, hours, minutes, seconds, milliseconds){
			var ret = {};

			minutes += addMinutes;
			hours += addHours;
			if (minutes >= 60){
				hours += 1;
				minutes -= 60;
			}
			if (hours >=24){
				++date;
				hours -= 24;
				var dateOfCurrMonth = month % 2 === 0 ? 31 : (month === 1 ? (isLeapYear(year) ? 29 : 28) : 30);
				if (date >= dateOfCurrMonth){
					++month;
					date -= dateOfCurrMonth;

					if (month >= 12){
						++year;
						month -= 12;
					}
				}
			}

			ret.year = year;
			ret.month = month;
			ret.date = date;
			ret.hours = hours;
			ret.minutes = minutes;
			ret.seconds = seconds;
			ret.milliseconds = milliseconds;

			return ret;
		};
		var regExp = new RegExp('^(\\d{4,4})'
				+ '-((?:0[123456789]|1[012]))'
				+ '-((?:0[123456789]|[12]\\d|3[01]))'
				+ 'T'
				+ '((?:[01]\\d|2[0123]))'
				+ ':([012345]\\d)'
				+ ':([012345]\\d)'
				+ '(?:.(\\d{3}))?'
				+ '(Z|[+-](?:[01]\\d|2[0123]):?[012345]\\d)$');
		var parseISOString2UTC = function(ISOString){
			var ret = {};
			var year = Number(RegExp.$1)
				, month = Number(RegExp.$2) - 1
				, date = Number(RegExp.$3)
				, hours = Number(RegExp.$4)
				, minutes = Number(RegExp.$5)
				, seconds = Number(RegExp.$6)
				, offset = RegExp.$8
				, milliseconds;
			milliseconds = (milliseconds = Number(RegExp.$7), !isNaN(milliseconds) && milliseconds || 0);

			if (offset === 'Z'){     
				ret.year = year;
				ret.month = month;
				ret.date = date;
				ret.hours = hours;
				ret.minutes = minutes;
				ret.seconds = seconds;
				ret.milliseconds = milliseconds;
			} 
			else if (typeof offset !== 'undefined'){     
				var symbol = offset.charAt(0);
				var offsetHours = Number(offset.substring(1,3));     
				var offsetMinutes = Number(offset.substring(offset.length > 5 ? 4 : 3));

				ret = operHoursAndMinutes[symbol](offsetHours, offsetMinutes, year, month, date, hours, minutes, seconds, milliseconds);
			}

			return ret;
		};
		
		var _nativeDate = Date;
		Date = function(Y,M,D,H,m,s,ms){
			var ret, len = arguments.length;
			if (!(this instanceof Date)){
				ret = _nativeDate.apply(null, arguments);
			}
			else if (len === 1 && typeof arguments[0] === 'string' && regExp.test(arguments[0])){
				var tmpRet;
				try{
					tmpRet = parseISOString2UTC();
				}
				catch(e){
					console && console.log('Invalid Date');
					return void 0;
				}

				ret = new _nativeDate(_nativeDate.UTC(tmpRet.year, tmpRet.month, tmpRet.date, tmpRet.hours, tmpRet.minutes, tmpRet.seconds, tmpRet.milliseconds));
			}
			else if (typeof arguments[0] === 'string'){
				ret = new _nativeDate(arguments[0]);
			}
			else{
				ret = len >= 7 ? new _nativeDate(Y, M, D, H, m, s, ms)
					: len >= 6 ? new _nativeDate(Y, M, D, H, m, s)
					: len >= 5 ? new _nativeDate(Y, M, D, H, m)
					: len >= 4 ? new _nativeDate(Y, M, D, H)
					: len >= 3 ? new _nativeDate(Y, M, D)
					: len >= 2 ? new _nativeDate(Y, M)
					: len >= 1 ? new _nativeDate(Y)
					: new _nativeDate();
			}

			return ret;
		};
		Date.prototype = _nativeDate.prototype;
		Date.prototype.constructor = Date;

		var _pad = function(num){
			if (num < 10){
				return '0' + num;
			}
			return num;
		};
		var _padMillisecond = function(num){
			if (num < 10){
				return '00' + num;
			}
			else if (num < 100){
				return '0' + num;
			}
			return num;
		};
		Date.prototype.toISOString = function(){
				return [this.getUTCFullYear(), '-', _pad(this.getUTCMonth() + 1), '-', _pad(this.getUTCDate()), 'T'
					, _pad(this.getUTCHours()), ':', _pad(this.getUTCMinutes()), ':', _pad(this.getUTCSeconds()), '.', _padMillisecond(this.getUTCMilliseconds()), 'Z'].join('');	
			};

		// 复制可枚举的类成员
		for (var clsProp in _nativeDate){
			if (_nativeDate.hasOwnProperty(clsProp)){
				Date[clsProp] = _nativeDate[clsProp];
			}
		}
		// 复制不可枚举的类成员
		var innumerableMems = ['UTC'];
		for (var i = 0, clsProp; clsProp = innumerableMems[i++];){
			Date[clsProp] = _nativeDate[clsProp];
		}

		Date.parse = function(str){
			if (['string', 'number'].indexOf(typeof str) === -1) return NaN;
			
			var isMatch = regExp.test(str), milliseconds = 0;
			if (!isMatch) return _nativeDate.parse(str);

			var tmpRet = parseISOString2UTC();

			return _nativeDate.UTC(tmpRet.year, tmpRet.month, tmpRet.date, tmpRet.hours, tmpRet.minutes, tmpRet.seconds, tmpRet.milliseconds);
		};
		Date.now = Date.now 
			|| function(){
				return +new this();
			};
	}

	/**	
	 * Object
	 */
	var _validateObjArg = function(obj, msg){
		if (['object', 'function'].indexOf(typeof obj) === -1 || null === obj) throw new TypeError(msg + ' called on non-object');
	};

	// IE8只支持Object.defineProperty(DOM对象), 不支持javascript对象
	var _defineProperty = Object.defineProperty;
	var supportDomDP = (function(){
		try{
			Object.defineProperty(document.createElement('div'), 'tmp', {value: 1});
		}			
		catch(e){
			return false;
		}
		return true;
	})();
	var supportObjDP = (function(){
		try{
			Object.defineProperty({}, 'tmp', {value: 1});
		}			
		catch(e){
			return false;
		}
		return true;
	})();


	Object.getPrototypeOf = Object.getPrototypeOf
		|| function(obj){
			_validateObjArg(obj, 'Object.getPrototypeOf');

			return obj.__proto__ || obj.constructor.prototype;
		};

	Object.isSealed = Object.isSealed
		|| function(obj){
			_validateObjArg(obj, 'Object.isSealed');

			return false;
		};

	Object.isFrozen = Object.isFrozen
		|| function(obj){
			_validateObjArg(obj, 'Object.isFrozen');

			return false;
		};

	Object.isExtensible = Object.isExtension
		|| function(obj){
			_validateObjArg(obj, 'Object.isExtensible');

			return true;
		};

	Object.freeze = Object.freeze 
		|| function(obj){
			_validateObjArg(obj, 'Object.freeze');

			// 什么都不做
			return obj;
		};

	Object.preventExtensions = Object.preventExtensions 
		|| function(obj){
			_validateObjArg(obj, 'Object.preventExtensions');

			// 什么都不做
			return obj;
		};

	Object.seal = Object.seal 
		|| function(obj){
			_validateObjArg(obj, 'Object.seal');

			// 什么都不做
			return obj;
		};

	if (!Object.getOwnPropertyNames){
		// IE678会出现对象重新设置下列属性后，虽然该属性为对象自身属性且属性值也被改变了。
		// 但不可遍历的特性依旧是false，无法通过for...in来获取
		// 由于IE678没有__defineGetter__、__lookupGetter__、__defineSetter__和__lookupSetter__方法，所以不存在重新设置却不可遍历的问题。
		var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'propertyIsEnumerable', 'constructor', 'hasOwnProperty'
			, 'isPrototypeOf'];
		var hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString');

		Object.getOwnPropertyNames = function(obj){
			_validateObjArg(obj, 'Object.getOwnPropertyNames');

			var names = [];
			for(var p in obj){
				if (p !== '__proto__' && obj.hasOwnProperty(p)){
					names.push(p);
				}
			}

			if (!hasDontEnumBug) return names;

			for (var i = 0, len = dontEnums.length; i < len; ++i){
				if (obj.hasOwnProperty(dontEnums[i])){
					names.push(dontEnums[i]);
				}
			}
			return names;
		};
	}

	Object.keys = Object.keys
		|| function(obj){
			_validateObjArg(obj, 'Object.keys');

			var ret = [];
			var names = Object.getOwnPropertyNames(obj), name;
			for (var i = 0, len = names; i < len; ++i){
				name = names[i];
				if (obj.propertyIsEnumerable(name)){
					ret.push(name);
				}	
			}

			return ret;
		};
	
	Object.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
		|| function(obj, propName){
			_validateObjArg(obj, 'Object.getOwnPropertyDescriptor');

			if (propName === '__proto__' || !obj.hasOwnProperty(propName)) return void 0;

			var baseDescriptor = {enumerable: true, configurable: true};

			// TODO：IE8的特征
			if (Object.prototype.__defineGetter__){
				var getter = Object.prototype.__lookupGetter__.call(obj, propName);
				var setter = Object.prototype.__lookupSetter__.call(obj, propName);

				if (getter){
					baseDescriptor.get = getter;
				}
				if (setter){
					baseDescriptor.set = setter;
				}

				if (getter || setter) return baseDescriptor;
			}

			baseDescriptor.value = obj[propName];
			baseDescriptor.writable = true;
			return baseDescriptor;
		};

	Object.defineProperty = function(obj, propName, descriptor){
			_validateObjArg(obj, 'Object.defineProperty');
			if (['object', 'function'].indexOf(typeof descriptor) === -1 || descriptor === null) throw new TypeError('Property description must be an object: ' + descriptor);

			var isDom = document === obj || (typeof Element !== 'undefined' && obj instanceof Element);
			var ret;
			// 1. 对于现代浏览器，调用原生方法
			// 2. 对于IE67，仅实现value值
			// 3. 对于IE8，对于dom则调用原生方法，对于javascript对象则仅实现value值
			if (supportObjDP && supportDomDP){
				ret = _defineProperty(obj, propName, descriptor);	
			}
			else if (!supportDomDP && !supportObjDP){
				obj[propName] = descriptor.value;
				ret = obj;
			}
			else if (!supportObjDP && supportDomDP){
				if (isDom){
					ret = _defineProperty(obj, propName, descriptor);
				}
				else{
					obj[propName] = descriptor.value;
					ret = obj;
				}
			}
			else{
				if (isDom){
					obj[propName] = descriptor.value;
					ret = obj;
				}
				else{
					ret = _defineProperty(obj, propName, descriptor);
				}
			}

			return ret;
		};
	
	Object.defineProperties = Object.defineProperties
		|| function(obj, options){
			_validateObjArg(obj, 'Object.defineProperties');
			if (typeof options === 'undefined' || options === null) throw new TypeError('Cannot convert undefined or null to object');
			if (typeof options !== 'object') return obj;

			for (var p in options){
				obj = Object.defineProperty(obj, p, options[p]);
			}	
			return obj;
		};

	Object.create = Object.create
		|| function(prototype, descriptors){
			if (['object', 'function'].indexOf(typeof prototype) === -1) throw new TypeError('Object prototype may only be an Object or null: ' + property);
			if (typeof descriptors === 'undefined' || descriptors === null) throw new TypeError('Cannot convert undefined or null to object');

			var ret;
			if (prototype === null){
				ret = {};
			}
			else{
				var ctor = function (){};
				ctor.prototype = prototype;
				ret = new ctor();
			}

			ret.__proto__ = ret.__proto__ || prototype;
			ret = Object.defineProperties(ret, descriptors);
			
			return ret;
		};

	/* 由于与语法有关，因此无法实现
	Object.prototype.__defineGetter__ = Object.prototype.__defineGetter__
		|| function(propName, getter){
			// TODO
		};
	Object.prototype.__defineSetter__ = Object.prototype.__defineSetter__
		|| function(propName, setter){
			// TODO
		};*/

	/**
	 * CSS
	 */	
	if (!window.getComputedStyle){
		var _convertCSS2LowerCamelCase = function(css){
			var parts = css.split('-'), part;
			var ret = [];
			for (var i = 0, len = parts.length; i < len; ++i) {
				part = parts[i];
				ret.push(i === 0 ? part : part.charAt(0).toUpperCase() + part.substring(1));
			}

			return ret.join('');
		};
		window.getComputedStyle = function(el/*, pseudoClass*/){
				var cssValueOfLegacy;
				if (typeof el !== 'object' || !(cssValueOfLegacy = el.currentStyle)) return null;

				var cssValue;
				cssValue.getPropertyValue = function(propName){
					var css = _convertCSS2LowerCamelCase(propName);
					return cssValueOfLegacy.getAttribute(css);
				};

				return cssValue;
			};
	}

	if (!document.defaultView){
		document.defaultView = window;
	}


	/**
	 * Event
	 */
	/*if (!document.dispatchEvent){

	 	var InvalidStateError = function(msg){
	 		this.message = msg;
	 	};
	 	InvalidStateError.prototype = new Error();

	 	global.HTMLEvent = function (){
	 		this.initEvent = function(type, canBubble, preventDefault){
	 			this.type = type;
	 			this.canBubble = canBubble;
	 			this.preventDefault = preventDefault;
	 		};
	 	};
	 	global.MouseEvent = function(){
	 		this.initMouseEvent = function(type, canBubble, preventDefault){
	 			this.type = type;
	 			this.canBubble = canBubble;
	 			this.preventDefault = preventDefault;
	 		};	
	 	};
	 	global.UIEvent = function(){
	 		this.initUIEvent = function(type, canBubble, preventDefault){
	 			this.type = type;
	 			this.canBubble = canBubble;
	 			this.preventDefault = preventDefault;
	 		};	
	 	};

	 	var _addEventListener = function(type, handler, phase){
	 		if (!arguments.length) return void 0;

	 		arguments[0] = 'on' + arguments[0];
	 		//this.attachEvent.apply(this, arguments);
	 	};
	 	var _removeEventListener = function(type, handler, phase){
	 		if (!arguments.length) return void 0;

	 		arguments[0] = 'on' + arguments;
	 		this.detachEvent.apply(this, arguments);
	 	};
	 	var _dispatchEvent = function(evt){
	 		if (!arguments.length) throw new TypeError("Failed to execute 'dispatchEvent' on 'EventTarget': 1 argument required, but only 0 present.");
	 		if (!HTMLEvent.prototype.isPrototypeOf(evt)
	 			&& !MouseEvent.prototype.isPrototypeOf(evt)
	 			&& !UIEvent.prototype.isPrototypeOf(evt)) return new InvalidStateError("Failed to execute 'dispatchEvent' on 'EventTarget': The event provided is null.");

	 		var evt4ie = window.createEventObject();
	 		this.fireEvent('on' + evt.type, evt4ie);
	 	};

	 	document.addEventListener = function(type, handler, phase){
	 		return _addEventListener.apply(this, arguments);
	 	};

	 	document.removeEventListener = function(type, handler, phase){
	 		return _removeEventListener.apply(this, arguments);
	 	};
	 	document.createEvent = function(eventType){
	 		var evt;
	 		switch(eventType){
	 			case 'MouseEvents':
	 				evt = new MouseEvent();
	 				break;
	 			case 'UIEvents':
	 				evt = new UIEvent();
	 				break;
	 			default:
	 				evt = new HTMLEvent();
	 				break;
	 		}

	 		return evt;
	 	};
	 	document.dispatchEvent = function(evt){
	 		_dispatchEvent.call(this, evt);
	 	};

	 	// ie8
	 	if (typeof Element !== 'undefined'){
	 		Element.prototype.addEventListener = function(type, handler, phase){
	 			_addEventListener.apply(this, arguments);
	 		};				
	 		Element.prototype.removeEventListener = function(type, handler, phase){
	 			_removeEventListener.apply(this, arguments);
	 		};
	 		Element.prototype.dispatchEvent = function(evt){
	 			_dispatchEvent.call(this, evt);
		 	};
	 	}
	 	else{
		 	// ie67 todo
		 	var _assembleES5Event = function(el){
		 		/*el.addEventListener = function(type, handler, phase){
		 			_addEventListener.apply(el, arguments);
		 		};
		 		el.removeEventListener = function(type, handler, phase){
		 			_removeEventListener.apply(el, arguments);	
		 		};
		 		el.dispatchEvent = function(evt){
		 			_dispatchEvent.call(el, evt);
		 		};*/
		 	/*};

		 	var tmpEl = document.createElement('div');
		 	var _getElementByIdOfElement = tmpEl.getElementById;
		 	var _getElementsByClassNameOfElement = tmpEl.getElementsByClassName;
		 	var _getElementsByTagNameOfElement = tmpEl.getElementsByTagName;

		 	var _getElementByIdOfDoc = document.getElementById;
		 	document.getElementById = function(id){
		 		var el = _getElementByIdOfDoc(id);
		 		_assembleES5Event(el);

		 		return el;
		 	};
		 	var _getElementsByClassNameOfDoc = document.getElementsByClassName;
		 	document.getElementsByClassName = function(className){
		 		var els = _getElementsByClassNameOfDoc(className);
		 		for(var i = 0, len = els.length; i < len; ++i){
		 			_assembleES5Event(els[i]);
		 		}

		 		return els;
		 	};
		 	var _getElementsByTagNameOfDoc = document.getElementsByTagName;
		 	document.getElementsByTagName = function(tagName){
		 		var els = _getElementsByTagNameOfDoc(tagName);
		 		for(var i = 0, len = els.length; i < len; ++i){
		 			_assembleES5Event(els[i]);
		 		}

		 		return els;
		 	}

	 	}
	}*/

	/**
	 * JSON todo
	 */
	/*if (typeof JSON === 'undefined'){
	 	JSON = {};

	 	var _validateJSONObjectStr = /^{(\s*".*"\s*:\s*(\d+|".*"|[]))*)?}$/;

	 	var _validateJSONArrayStr = /^[]$/;

	 	var _recursive = function(obj){

	 	};

	 	JSON.parse = function(text, reviver){
	 		var typeofText = Object.prototype.toString.call(text);
	 		if (text === '[object Array]') throw new SyntaxError('Unexpected end of input');
	 		if (text === '[object Object]') throw new SyntaxError('Unexpected token o');

	 		var obj;
	 		if (document.documentMode){
	 			// IE	
	 			obj = eval('(' + json + ')');
	 		}
	 		else{
	 			// FF
	 			obj = (new Function('return ' + json + ';'))();
	 		}

	 		if (typeof reviver !== 'function') return obj;



	 		return obj;
	 	};
	 	JSON.stringify = function(obj){

	 	};
	 }*/

	// IE67 polyfill
	// Date
	Date.prototype.toJSON = Date.prototype.toJSON
		|| function(){
			if (typeof Date.prototype.toISOString !== 'function'){
				throw new TypeError();
			}

			return this.toISOString();
		};

	// ES6
	// String
	String.prototype.contains = String.prototype.contains
		|| function(searchValue, fromIndex){
			return String.prototype.indexOf.apply(this, arguments) !== -1;	
		};
	String.prototype.startsWith = String.prototype.startsWith
		|| function(searchValue, fromIndex){
			return String.prototype.indexOf.apply(this, arguments) === 0;	
		};
	String.prototype.endsWith = String.prototype.endsWith
		|| function(searchValue, fromIndex){
			return String.prototype.lastIndexOf(this, arguments) + searchValue.length === Math.max(fromIndex + 1, this.length);
		};
	String.prototype.repeat = String.prototype.repeat
		|| function(times){
			var _times = parseFloat(times);
			if (_times !== times) throw new TypeError();
			if (_times < 0 || !isFinite(_times)) throw new RangeError();

			_times = parseInt(times);
			var ret = '';
			for (var i = 0, len = _times; i++ < len;){
				ret += this;
			}

			return ret;
		};

	// Other
	// String
	String.prototype.trimLeft = function(){
		return this.replace(/^\s+/i, '');
	};	
	String.prototype.trimRight = function(){
		return this.replace(/\s+$/i, '');
	};

}());
