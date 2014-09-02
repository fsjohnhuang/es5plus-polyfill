/*!
 * @module 选择器polyfill by ^_^肥仔John
 */
(function(global, doc){
	var nativeQS = doc.querySelector;	
	var nativeQSA = doc.querySelectorAll;

	/**/
	TYPE = ['ID', ''];

	var ridentifier = '(?:\\\\.|[\\w-]|[^\\x00-\\xa0])';
	var rTokens = {
		'ID': {r: new RegExp('^#(' + ridentifier + '+)', 'i')},
		'CLS': {r: new RegExp('^\\.(' + ridentifier + '+)', 'i')},
		'TAG': {r: new RegExp('^(' + ridentifier + '+)', 'i')},
		'COMBINATOR': {r: /^\s*([+~>\s])\s*/},
		'PSEDUO': {r: /:(first|last|odd|even|eq|lt|gt|contains|has|not)\(([^()]*)\)/}
	};
	var _wrapExec = function(type, r){
		return function(str){
			var matcher = r.exec(str);

			return matcher
				? {
					type: ['COMBINATOR', 'PSEDUO'].indexOf(type) >= 0 ? matcher[1] : type,
					value: matcher[1],
					matcher: matcher
				}
				: null;
		};	
	};
	for (var type in rTokens){
		var rToken = rTokens[type];
		rToken.exec = _wrapExec(type, rToken.r);
	}
	/**
	 * 词法分析
	 * @method
	 * @param {String} selector CSS Selector字符串
	 * @return {Array} Tokens
	 */
	var tokenize = global.tokenize = function(selector){
		selector = selector.trim();

		var tokens = [], matcher;
		while (selector.length > 0){
			token = rTokens.COMBINATOR.exec(selector) 
				|| rTokens.ID.exec(selector)
				|| rTokens.CLS.exec(selector)
				|| rTokens.TAG.exec(selector)
				|| rTokens.PSEDUO.exec(selector);
			if (!token) return null; 

			tokens.push(token);
			selector = selector.replace(token.matcher[0], '');
		}

		return tokens;
	};
	
	var nsWrapers = {};
	nsWrapers.getElementById = function(node){
		var host = node;
		var nativeGetById = host.getElementById;
		/** 修复IE567下document.geElementById会获取name属性值相同的元素
		 * 修复IE5678下document.geElementById没有继承Function方法的诡异行为
		 * @method
		 * @param {String} id
		 * @return {HTMLElement|Null}
		 */
		return function(id){
			var node = nativeGetById.call(host, id);
			if (node && node.id !== id){
				var nodes = doc.all[id];
				var i = 0;
				for (;(node = nodes && nodes[i++] || null, node && node.id !== id);){}
			}

			wraperFactory(node);
			return node;
		};
	};
	nsWrapers.getElementsByName = function(node){
		var host = node;
		var nativeGetByName = host.getElementsByName;
		/** 修复IE5678下document.geElementsByName没有继承Function方法的诡异行为
		 * @method
	     */
		return function(tag){
			var nodes = nativeGetByName.call(host, tag);

			wraperFactory(nodes);
			return nodes;
		};
	};
	nsWrapers.getElementsByTagName = function(node){
		var host = node;
		var nativeGetByTagName = host.getElementsByTagName;
		/** 修复IE5678下document.geElementsByTagName没有继承Function方法的诡异行为
		 * @method
	     */
		return function(tag){
			var nodes = nativeGetByTagName.call(host, tag);

			wraperFactory(nodes);
			return nodes;
		};
	};
	
	// polyfill返回结果非HTMLCollection类型，与文档结构非实时同步
	nsWrapers.getElementsByClassName = function(node){
		var host = node;
		var nativeGetByClassName = host.getElementsByClassName;

		return nativeGetByClassName ? function(cls){
			var nodes = nativeGetByClassName.call(node, cls);
			wraperFactory(nodes);

			return nodes;
		} : function(cls){
			var seed = host.all, nodes = [], node;
			for (var i = 0, len = nodes.length; i < len; ++i){
				node = nodes[i];
				if (node.nodeType === 1){
					node.className.search(new RegExp('\\b' + cls + '\\b', 'i')) >= 0 && nodes.push(node);
				}
			}

			wraperFactory(nodes);

			// 模拟HTMLCollection的item和namedItem行为
			nodes.item = function(index){
				var i = Number(index);
				return this[i] || this[0];
			};
			nodes.namedItem = function(idorName){
				for (var i = 0, node; node = this[i++];){
					if (node.id === idorName || node.name === idorName){
						return node;
					}
				}
			};
			for (var i = 0, node, id, name; node = nodes[i++];){
				id = node.id;
				name = node.name;
				if (id && !nodes[id]){
					nodes[id] = node;
				}
				if (name && !nodes[name]){
					nodes[name] = node;
				}
			}

			return nodes;
		};
	};
	nsWrapers.querySelector = function(node){
		var host = node;
		var nativeQS = host.querySelector;

		return function(selector){

		};
	};
	nsWrapers.querySelectorAll = function(node){
		var host = node;
		var nativeQSA = host.querySelectorAll;

		return function(selector){

		};
	};


	var htmlElSelectors = ['getElementsByTagName', 'getElementsByClassName'];
	var htmlDocSelectors = htmlElSelectors.concat(['getElementById', 'getElementsByName']);
	var wraperFactory = function(node){
		if (!node) return void 0;

		if (node.tagName !== 'form' && node.length && node[0]){
			for (var i = node.length - 1; i >= 0; --i){
				wraperFactory(node[i]);
			}
		}
		else{
			var ns = !node.ownerDocument ? htmlDocSelectors : htmlElSelectors
			, i = 0, currNS, currWraper;
			while (currNS = ns[i++]){
				if (currWraper = nsWrapers[currNS]){
					node[currNS] = currWraper(node);
				}
			}
			if (node.ownerDocument){
				node.classList = classListWrapper(node);
			}
		}
	};

	// polyfill classList
	var InvalidCharacterError = function(msg){
		this.message = msg;
		this.code = 5;
		this.name = 'InvalidCharacterError';
	};
	InvalidCharacterError.prototype = DOMException;

	var checkInvalidCharacterError = function(str, r, msg){
		if (r.test(str)){
			throw new InvalidCharacterError(msg);
		}
	};
	var invalidCharacterErrorMsg = ["Failed to execute '", , "' on 'DOMTokenList': The token provided ('", ,"') contains HTML space characters, which are not valid in tokens."];
	var classListWrapper = function(node){
		var host = node
			, _inner = host.className ? host.className.trim().split(/\s+/) : []
			, listener = function(e){
				if (e.propertyName !== 'className') return;

				var cLst = host.classList;
				var oLen = _inner.length;
				_inner = host.className ? host.className.trim().split(/\s+/) : [];
				cLst.length = _inner.length;	
				for (var i = 0, len = cLst.length; i < Math.max(oLen, len); ++i){
					if (i < len){
						cLst[i] = _inner[i];
					}
					else{
						delete cLst[i];
					}
				}
			};
		host.attachEvent('onpropertychange', listener);

		var classList = {
			length: _inner.length,
			item: function(index){
				return _inner[index] || null;
			},
			add: function(cls){
				checkInvalidCharacterError(cls, /\s+/, (invalidCharacterErrorMsg[1] = 'add', invalidCharacterErrorMsg[3] = cls, invalidCharacterErrorMsg).join())
				if (this.contains(cls)) return void 0;	

				host.detachEvent('onpropertychange', listener);
				host.className += ' ' + cls;	
				_inner.push(cls);
				this[this.length++] = cls;
				host.attachEvent('onpropertychange', listener);
			},
			remove: function(cls){
				checkInvalidCharacterError(cls, /\s+/, (invalidCharacterErrorMsg[1] = 'remove', invalidCharacterErrorMsg[3] = cls, invalidCharacterErrorMsg).join())
				if (!this.contains(cls)) return void 0;

				host.className = host.className.replace(new RegExp('\\b' + cls + '\\b', 'i'), '').trim();
				_inner.splice(_inner.indexOf(cls), 1);
				--this.length;
			},
			toggle: function(cls){
				checkInvalidCharacterError(cls, /\s+/, (invalidCharacterErrorMsg[1] = 'toggle', invalidCharacterErrorMsg[3] = cls, invalidCharacterErrorMsg).join())
				this[this.contains(cls) ? 'remove' : 'add'](cls);
			},
			contains: function(cls){
				checkInvalidCharacterError(cls, /\s+/, (invalidCharacterErrorMsg[1] = 'contains', invalidCharacterErrorMsg[3] = cls, invalidCharacterErrorMsg).join())
				return host.className.search(new RegExp('\\b' + cls + '\\b', 'i')) >= 0;
			},
			toString: function(){
				return _inner.toString();
			}
		};
		for (var i = 0, len = _inner.length; i < len; ++i){
			classList[i] = _inner[i];
		}

		return classList;
	};

	// IE56789执行polyfill
	(function(){
		'use strict';
		return !!this;
	}()) && wraperFactory(doc);
}(window, document));