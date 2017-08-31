let tmplEncodeReg = /[<>&"'\x00]/g
let tmplEncodeMap = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;'
}

function compile (str) {
  return str.replace(/([\s'\\])(?![^%]*%\})|(?:\{%(=|#)([\s\S]+?)%\})|(\{%)|(%\})/g, function (s, p1, p2, p3, p4, p5) {
    if (p1) { // whitespace, quote and backspace in interpolation context
      return {
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
        ' ': ' '
      }[s] || '\\' + s
    }
    if (p2) { // interpolation: {%=prop%}, or unescaped: {%#prop%}
      if (p2 === '=') {
        return "'\r\n+slash(" + p3 + ")+'"
      }
      return "'\r\n+(" + p3 + ")+'"
    }
    if (p4) { // evaluation start tag: {%
      return "';\r\n"
    }
    if (p5) { // evaluation end tag: %}
      return "\r\n_tmp_+='"
    }
  })
}

function slash (s) {
  return String(s || '').replace(tmplEncodeReg, (c) => tmplEncodeMap[c] || '')
}

let Func = Function

export function tmpl (str) {
  let func = new Func('state, slash', "let _tmp_=''; {_tmp_='" +
    compile(str || '') + "';}\r\n return _tmp_")
  return (state) => func(state, slash)
}
