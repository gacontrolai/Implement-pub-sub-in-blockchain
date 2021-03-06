function Config(t) {
  (this._curve = t), (this._default_curve = new Curve());
}
function default_curve() {
  var t = new Config();
  return t.set_curve_by_default(), t.curve();
}
function Curve(t) {
  t === void 0 && (t = "secp256k1");
  var e = null;
  _supported_curves.includes(t) && (e = secp256k1),
    (this._curve = e),
    (this._name = t),
    (this._order = e.curve.n),
    (this._generator = e.curve.g),
    (this._order_size = e.curve.n.byteLength());
}
function Scalar(t, e) {
  (this._scalar = t), (this._curve = e);
}
function GroupElement(t, e) {
  (this._ec_point = t), (this._curve = e);
}
function to_hex(t) {
  return Array.from(t, function (t) {
    return ("0" + (255 & t).toString(16)).slice(-2);
  }).join("");
}
function from_hex(t) {
  for (var e = []; t.length >= 2; ) e.push(parseInt(t.substring(0, 2), 16)), (t = t.substring(2, t.length));
  return e;
}
function SHA256(t) {
  var e = sha256.update(to_hex(t.to_bytes())).digest();
  return new Scalar(new BN(e));
}
function hash_to_scalar(t) {
  for (var e = sha256.create(), i = 0; t.length > i; i++) e.update(to_hex(t[i].to_bytes()));
  var r = e.digest(),
    n = new BN(r),
    f = new BN(1);
  return new Scalar(n.add(f));
}
function PrivateKey(t, e) {
  (this._scalar = t),
    e === void 0 && ((curve = new Curve()), (e = new PublicKey(new GroupElement(curve.generator().mul(t.valueOf()))))),
    (this._public_key = e);
}
function PublicKey(t) {
  this.pubKey = t;
}
function ReEncryptionKey(t, e) {
  (this._re_key = t), (this._internal_public_key = e);
}
function Capsule(t, e, i, r, n) {
  n === void 0 && (n = !1), (this._E = t), (this._V = e), (this._S = i), (this._XG = r), (this._re_encrypted = n);
}
function KeyPair(t, e) {
  (this._private_key = t), (this._public_key = e);
}
function Proxy() {}
(Config.prototype.set_curve_by_default = function () {
  this.set_curve(this._default_curve);
}),
  (Config.prototype.set_curve = function (t) {
    t === void 0 && (t = this._default_curve), (this._curve = t);
  }),
  (Config.prototype.curve = function () {
    return this._curve === void 0 && this.set_curve_by_default(), this._curve;
  });
var _supported_curves = ["secp256k1"];
(Curve.prototype.name = function () {
  return this._name;
}),
  (Curve.prototype.order = function () {
    return this._order;
  }),
  (Curve.prototype.generator = function () {
    return this._generator;
  }),
  (Curve.prototype.order_size = function () {
    return this._order_size;
  }),
  (Scalar.expected_byte_length = function (t) {
    return t === void 0 && (t = default_curve()), t.order_size();
  }),
  (Scalar.generate_random = function (t) {
    return t === void 0 && (t = default_curve()), new Scalar(t._curve.genKeyPair().getPrivate());
  }),
  (Scalar.prototype.curve = function () {
    return this._curve === void 0 && (this._curve = default_curve()), this._curve;
  }),
  (Scalar.prototype.valueOf = function () {
    return this._scalar;
  }),
  (Scalar.from_bytes = function (t) {
    if (t.length != Scalar.expected_byte_length() && t.length != 2 * Scalar.expected_byte_length()) throw Error("Invalid length of data.");
    return new Scalar(new BN(t));
  }),
  (Scalar.prototype.to_bytes = function () {
    var t = this._scalar.toArray();
    return 33 == t.length ? t.slice(1, 33) : t;
  }),
  (Scalar.prototype.add = function (t) {
    return new Scalar(this.valueOf().add(t.valueOf()));
  }),
  (Scalar.prototype.sub = function (t) {
    return new Scalar(this.valueOf().sub(t.valueOf()));
  }),
  (Scalar.prototype.mul = function (t) {
    return new Scalar(this.valueOf().mul(t.valueOf()).mod(this.curve().order()));
  }),
  (Scalar.prototype.eq = function (t) {
    return this.valueOf().eq(t.valueOf());
  }),
  (Scalar.prototype.invm = function () {
    return new Scalar(this.valueOf().invm(this.curve().order()));
  }),
  (GroupElement.expected_byte_length = function (t, e) {
    return t === void 0 && (t = default_curve()), e ? 1 + t.order_size() : 1 + 2 * t.order_size();
  }),
  (GroupElement.generate_random = function (t) {
    return t === void 0 && (t = default_curve()), new GroupElement(t.generator().mul(Scalar.generate_random().valueOf()));
  }),
  (GroupElement.from_bytes = function (t) {
    var e = GroupElement.expected_byte_length();
    if (t.length != e) throw Error("Invalid length of data.");
    var i = Scalar.expected_byte_length(),
      r = t.slice(1, i + 1),
      n = t.slice(i + 1, e);
    return new GroupElement(default_curve()._curve.curve.point(r, n));
  }),
  (GroupElement.prototype.to_bytes = function () {
    var t = this._ec_point.getX().toArray(),
      e = this._ec_point.getY().toArray();
    return [4].concat(t, e);
  }),
  (GroupElement.prototype.valueOf = function () {
    return this._ec_point;
  }),
  (GroupElement.prototype.add = function (t) {
    return new GroupElement(this.valueOf().add(t.valueOf()));
  }),
  (GroupElement.prototype.mul = function (t) {
    return new GroupElement(this.valueOf().mul(t.valueOf()));
  }),
  (GroupElement.prototype.eq = function (t) {
    return this.valueOf().eq(t.valueOf());
  }),
  (PrivateKey.generate = function (t, e) {
    e === void 0 && (e = default_curve()), t !== void 0 && (t = t.toString("hex"));
    var i = e._curve.genKeyPair(t);
    return new PrivateKey(new Scalar(i.getPrivate()), new PublicKey(new GroupElement(i.getPublic())));
  }),
  (PrivateKey.prototype.valueOf = function () {
    return this._scalar;
  }),
  (PrivateKey.prototype.get_public_key = function () {
    return (curve = new Curve()), new PublicKey(new GroupElement(curve.generator().mul(this.valueOf().valueOf())));
  }),
  (PrivateKey.from_bytes = function (t) {
    return new PrivateKey(Scalar.from_bytes(t));
  }),
  (PrivateKey.prototype.to_bytes = function () {
    return this.valueOf().to_bytes();
  }),
  (PublicKey.prototype.valueOf = function () {
    return this.pubKey;
  }),
  (PublicKey.from_bytes = function (t) {
    return new PublicKey(GroupElement.from_bytes(t));
  }),
  (PublicKey.prototype.to_bytes = function () {
    return this.valueOf().to_bytes();
  }),
  (ReEncryptionKey.prototype.get_re_key = function () {
    return this._re_key;
  }),
  (ReEncryptionKey.prototype.get_internal_public_key = function () {
    return this._internal_public_key;
  }),
  (ReEncryptionKey.from_bytes = function (t) {
    var e = Scalar.expected_byte_length(),
      i = GroupElement.expected_byte_length();
    if (t.length != i + e) throw Error("Invalid length of data.");
    var r = Scalar.from_bytes(t.slice(0, e)),
      n = GroupElement.from_bytes(t.slice(e, e + i));
    return new ReEncryptionKey(r, n);
  }),
  (ReEncryptionKey.prototype.to_bytes = function () {
    var t = this.get_re_key().to_bytes(),
      e = this.get_internal_public_key().to_bytes();
    return t.concat(e);
  }),
  (Capsule.prototype.get_E = function () {
    return this._E;
  }),
  (Capsule.prototype.get_V = function () {
    return this._V;
  }),
  (Capsule.prototype.get_S = function () {
    return this._S;
  }),
  (Capsule.prototype.get_XG = function () {
    return this._XG;
  }),
  (Capsule.prototype.set_re_encrypted = function () {
    this._re_encrypted = !0;
  }),
  (Capsule.prototype.is_re_encrypted = function () {
    return this._re_encrypted;
  }),
  (Capsule.from_bytes = function (t) {
    var e = Scalar.expected_byte_length(),
      i = GroupElement.expected_byte_length(),
      r = !1;
    if (t.length == 3 * i + e) r = !0;
    else if (t.length != 2 * i + e) throw Error("Invalid length of data.");
    var n = GroupElement.from_bytes(t.slice(0, i)),
      f = GroupElement.from_bytes(t.slice(i, 2 * i)),
      a = Scalar.from_bytes(t.slice(2 * i, 2 * i + e)),
      h = void 0;
    return r && (h = GroupElement.from_bytes(t.slice(2 * i + e, 3 * i + e))), new Capsule(n, f, a, h, r);
  }),
  (Capsule.prototype.to_bytes = function () {
    var t = this.get_E().to_bytes(),
      e = this.get_V().to_bytes(),
      i = this.get_S().to_bytes(),
      r = [];
    return this.is_re_encrypted() && (r = this.get_XG().to_bytes()), t.concat(e, i, r);
  }),
  (KeyPair.generate_key_pair = function (t) {
    var e = PrivateKey.generate(t);
    return new KeyPair(e, e.get_public_key());
  }),
  (KeyPair.prototype.get_public_key = function () {
    return this._public_key;
  }),
  (KeyPair.prototype.get_private_key = function () {
    return this._private_key;
  }),
  (Proxy.generate_key_pair = function (t) {
    return KeyPair.generate_key_pair(t);
  }),
  (Proxy.encapsulate = function (t) {
    var e = Proxy.generate_key_pair(),
      i = Proxy.generate_key_pair(),
      r = e.get_private_key().valueOf(),
      n = i.get_private_key().valueOf(),
      f = e.get_public_key().valueOf(),
      a = i.get_public_key().valueOf(),
      h = [f, a],
      s = hash_to_scalar(h),
      o = r.add(n.mul(s)),
      d = t.valueOf(),
      u = d.mul(r.add(n)),
      c = SHA256(u),
      l = new Capsule(f, a, o),
      b = { capsule: l, symmetric_key: c };
    return b;
  }),
  (Proxy.decapsulate_original = function (t, e) {
    var i = e.valueOf(),
      r = t.get_E().add(t.get_V()),
      n = r.mul(i),
      f = SHA256(n);
    return f;
  }),
  (Proxy.generate_re_encryption_key = function (t, e) {
    var i = Proxy.generate_key_pair(),
      r = i.get_private_key().valueOf(),
      n = i.get_public_key().valueOf(),
      f = e.valueOf(),
      a = [n, f, f.mul(r)],
      h = hash_to_scalar(a),
      s = t.valueOf(),
      o = h.invm(),
      d = s.mul(o),
      u = new ReEncryptionKey(d, n);
    return u;
  }),
  (Proxy.re_encrypt_capsule = function (t, e) {
    var i = t.get_E().mul(e.get_re_key()),
      r = t.get_V().mul(e.get_re_key()),
      n = t.get_S();
    return new Capsule(i, r, n, e.get_internal_public_key(), !0);
  }),
  (Proxy.decapsulate_re_encrypted = function (t, e) {
    var i = t.get_XG(),
      r = t.get_E(),
      n = t.get_V(),
      f = [i, e.get_public_key().valueOf(), i.mul(e.valueOf())],
      a = hash_to_scalar(f),
      h = r.add(n).mul(a),
      s = SHA256(h);
    return s;
  }),
  (Proxy.decapsulate = function (t, e) {
    return t.is_re_encrypted() ? Proxy.decapsulate_re_encrypted(t, e) : Proxy.decapsulate_original(t, e);
  }),
  (Proxy.private_key_from_bytes = function (t) {
    return PrivateKey.from_bytes(t);
  }),
  (Proxy.public_key_from_bytes = function (t) {
    return PublicKey.from_bytes(t);
  }),
  (Proxy.re_encryption_key_from_bytes = function (t) {
    return ReEncryptionKey.from_bytes(t);
  }),
  (Proxy.capsule_from_bytes = function (t) {
    return Capsule.from_bytes(t);
  }),
  (function (t) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = t();
    else if ("function" == typeof define && define.amd) define([], t);
    else {
      var e;
      (e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this),
        (e.elliptic = t());
    }
  })(function () {
    return (function t(e, i, r) {
      function n(a, h) {
        if (!i[a]) {
          if (!e[a]) {
            var s = "function" == typeof require && require;
            if (!h && s) return s(a, !0);
            if (f) return f(a, !0);
            var o = Error("Cannot find module '" + a + "'");
            throw ((o.code = "MODULE_NOT_FOUND"), o);
          }
          var d = (i[a] = { exports: {} });
          e[a][0].call(
            d.exports,
            function (t) {
              var i = e[a][1][t];
              return n(i ? i : t);
            },
            d,
            d.exports,
            t,
            e,
            i,
            r
          );
        }
        return i[a].exports;
      }
      for (var f = "function" == typeof require && require, a = 0; r.length > a; a++) n(r[a]);
      return n;
    })(
      {
        1: [
          function (t, e, i) {
            "use strict";
            var r = i;
            (r.version = t("../package.json").version),
              (r.utils = t("./elliptic/utils")),
              (r.rand = t("brorand")),
              (r.curve = t("./elliptic/curve")),
              (r.curves = t("./elliptic/curves")),
              (r.ec = t("./elliptic/ec")),
              (r.eddsa = t("./elliptic/eddsa"));
          },
          {
            "../package.json": 30,
            "./elliptic/curve": 4,
            "./elliptic/curves": 7,
            "./elliptic/ec": 8,
            "./elliptic/eddsa": 11,
            "./elliptic/utils": 15,
            brorand: 17,
          },
        ],
        2: [
          function (t, e) {
            "use strict";
            function i(t, e) {
              (this.type = t),
                (this.p = new n(e.p, 16)),
                (this.red = e.prime ? n.red(e.prime) : n.mont(this.p)),
                (this.zero = new n(0).toRed(this.red)),
                (this.one = new n(1).toRed(this.red)),
                (this.two = new n(2).toRed(this.red)),
                (this.n = e.n && new n(e.n, 16)),
                (this.g = e.g && this.pointFromJSON(e.g, e.gRed)),
                (this._wnafT1 = Array(4)),
                (this._wnafT2 = Array(4)),
                (this._wnafT3 = Array(4)),
                (this._wnafT4 = Array(4));
              var i = this.n && this.p.div(this.n);
              !i || i.cmpn(100) > 0 ? (this.redN = null) : ((this._maxwellTrick = !0), (this.redN = this.n.toRed(this.red)));
            }
            function r(t, e) {
              (this.curve = t), (this.type = e), (this.precomputed = null);
            }
            var n = t("bn.js"),
              f = t("../../elliptic"),
              a = f.utils,
              h = a.getNAF,
              s = a.getJSF,
              o = a.assert;
            (e.exports = i),
              (i.prototype.point = function () {
                throw Error("Not implemented");
              }),
              (i.prototype.validate = function () {
                throw Error("Not implemented");
              }),
              (i.prototype._fixedNafMul = function (t, e) {
                o(t.precomputed);
                var i = t._getDoubles(),
                  r = h(e, 1),
                  n = (1 << (i.step + 1)) - (0 === i.step % 2 ? 2 : 1);
                n /= 3;
                for (var f = [], a = 0; r.length > a; a += i.step) {
                  for (var s = 0, e = a + i.step - 1; e >= a; e--) s = (s << 1) + r[e];
                  f.push(s);
                }
                for (var d = this.jpoint(null, null, null), u = this.jpoint(null, null, null), c = n; c > 0; c--) {
                  for (var a = 0; f.length > a; a++) {
                    var s = f[a];
                    s === c ? (u = u.mixedAdd(i.points[a])) : s === -c && (u = u.mixedAdd(i.points[a].neg()));
                  }
                  d = d.add(u);
                }
                return d.toP();
              }),
              (i.prototype._wnafMul = function (t, e) {
                var i = 4,
                  r = t._getNAFPoints(i);
                i = r.wnd;
                for (var n = r.points, f = h(e, i), a = this.jpoint(null, null, null), s = f.length - 1; s >= 0; s--) {
                  for (var e = 0; s >= 0 && 0 === f[s]; s--) e++;
                  if ((s >= 0 && e++, (a = a.dblp(e)), 0 > s)) break;
                  var d = f[s];
                  o(0 !== d),
                    (a =
                      "affine" === t.type
                        ? d > 0
                          ? a.mixedAdd(n[(d - 1) >> 1])
                          : a.mixedAdd(n[(-d - 1) >> 1].neg())
                        : d > 0
                        ? a.add(n[(d - 1) >> 1])
                        : a.add(n[(-d - 1) >> 1].neg()));
                }
                return "affine" === t.type ? a.toP() : a;
              }),
              (i.prototype._wnafMulAdd = function (t, e, i, r, n) {
                for (var f = this._wnafT1, a = this._wnafT2, o = this._wnafT3, d = 0, u = 0; r > u; u++) {
                  var c = e[u],
                    l = c._getNAFPoints(t);
                  (f[u] = l.wnd), (a[u] = l.points);
                }
                for (var u = r - 1; u >= 1; u -= 2) {
                  var b = u - 1,
                    p = u;
                  if (1 === f[b] && 1 === f[p]) {
                    var m = [e[b], null, null, e[p]];
                    0 === e[b].y.cmp(e[p].y)
                      ? ((m[1] = e[b].add(e[p])), (m[2] = e[b].toJ().mixedAdd(e[p].neg())))
                      : 0 === e[b].y.cmp(e[p].y.redNeg())
                      ? ((m[1] = e[b].toJ().mixedAdd(e[p])), (m[2] = e[b].add(e[p].neg())))
                      : ((m[1] = e[b].toJ().mixedAdd(e[p])), (m[2] = e[b].toJ().mixedAdd(e[p].neg())));
                    var v = [-3, -1, -5, -7, 0, 7, 5, 1, 3],
                      y = s(i[b], i[p]);
                    (d = Math.max(y[0].length, d)), (o[b] = Array(d)), (o[p] = Array(d));
                    for (var g = 0; d > g; g++) {
                      var M = 0 | y[0][g],
                        w = 0 | y[1][g];
                      (o[b][g] = v[3 * (M + 1) + (w + 1)]), (o[p][g] = 0), (a[b] = m);
                    }
                  } else (o[b] = h(i[b], f[b])), (o[p] = h(i[p], f[p])), (d = Math.max(o[b].length, d)), (d = Math.max(o[p].length, d));
                }
                for (var _ = this.jpoint(null, null, null), S = this._wnafT4, u = d; u >= 0; u--) {
                  for (var A = 0; u >= 0; ) {
                    for (var x = !0, g = 0; r > g; g++) (S[g] = 0 | o[g][u]), 0 !== S[g] && (x = !1);
                    if (!x) break;
                    A++, u--;
                  }
                  if ((u >= 0 && A++, (_ = _.dblp(A)), 0 > u)) break;
                  for (var g = 0; r > g; g++) {
                    var c,
                      R = S[g];
                    0 !== R &&
                      (R > 0 ? (c = a[g][(R - 1) >> 1]) : 0 > R && (c = a[g][(-R - 1) >> 1].neg()),
                      (_ = "affine" === c.type ? _.mixedAdd(c) : _.add(c)));
                  }
                }
                for (var u = 0; r > u; u++) a[u] = null;
                return n ? _ : _.toP();
              }),
              (i.BasePoint = r),
              (r.prototype.eq = function () {
                throw Error("Not implemented");
              }),
              (r.prototype.validate = function () {
                return this.curve.validate(this);
              }),
              (i.prototype.decodePoint = function (t, e) {
                t = a.toArray(t, e);
                var i = this.p.byteLength();
                if ((4 === t[0] || 6 === t[0] || 7 === t[0]) && t.length - 1 === 2 * i) {
                  6 === t[0] ? o(0 === t[t.length - 1] % 2) : 7 === t[0] && o(1 === t[t.length - 1] % 2);
                  var r = this.point(t.slice(1, 1 + i), t.slice(1 + i, 1 + 2 * i));
                  return r;
                }
                if ((2 === t[0] || 3 === t[0]) && t.length - 1 === i) return this.pointFromX(t.slice(1, 1 + i), 3 === t[0]);
                throw Error("Unknown point format");
              }),
              (r.prototype.encodeCompressed = function (t) {
                return this.encode(t, !0);
              }),
              (r.prototype._encode = function (t) {
                var e = this.curve.p.byteLength(),
                  i = this.getX().toArray("be", e);
                return t ? [this.getY().isEven() ? 2 : 3].concat(i) : [4].concat(i, this.getY().toArray("be", e));
              }),
              (r.prototype.encode = function (t, e) {
                return a.encode(this._encode(e), t);
              }),
              (r.prototype.precompute = function (t) {
                if (this.precomputed) return this;
                var e = { doubles: null, naf: null, beta: null };
                return (
                  (e.naf = this._getNAFPoints(8)), (e.doubles = this._getDoubles(4, t)), (e.beta = this._getBeta()), (this.precomputed = e), this
                );
              }),
              (r.prototype._hasDoubles = function (t) {
                if (!this.precomputed) return !1;
                var e = this.precomputed.doubles;
                return e ? e.points.length >= Math.ceil((t.bitLength() + 1) / e.step) : !1;
              }),
              (r.prototype._getDoubles = function (t, e) {
                if (this.precomputed && this.precomputed.doubles) return this.precomputed.doubles;
                for (var i = [this], r = this, n = 0; e > n; n += t) {
                  for (var f = 0; t > f; f++) r = r.dbl();
                  i.push(r);
                }
                return { step: t, points: i };
              }),
              (r.prototype._getNAFPoints = function (t) {
                if (this.precomputed && this.precomputed.naf) return this.precomputed.naf;
                for (var e = [this], i = (1 << t) - 1, r = 1 === i ? null : this.dbl(), n = 1; i > n; n++) e[n] = e[n - 1].add(r);
                return { wnd: t, points: e };
              }),
              (r.prototype._getBeta = function () {
                return null;
              }),
              (r.prototype.dblp = function (t) {
                for (var e = this, i = 0; t > i; i++) e = e.dbl();
                return e;
              });
          },
          { "../../elliptic": 1, "bn.js": 16 },
        ],
        3: [
          function (t, e) {
            "use strict";
            function i(t) {
              (this.twisted = 1 !== (0 | t.a)),
                (this.mOneA = this.twisted && -1 === (0 | t.a)),
                (this.extended = this.mOneA),
                s.call(this, "edwards", t),
                (this.a = new a(t.a, 16).umod(this.red.m)),
                (this.a = this.a.toRed(this.red)),
                (this.c = new a(t.c, 16).toRed(this.red)),
                (this.c2 = this.c.redSqr()),
                (this.d = new a(t.d, 16).toRed(this.red)),
                (this.dd = this.d.redAdd(this.d)),
                o(!this.twisted || 0 === this.c.fromRed().cmpn(1)),
                (this.oneC = 1 === (0 | t.c));
            }
            function r(t, e, i, r, n) {
              s.BasePoint.call(this, t, "projective"),
                null === e && null === i && null === r
                  ? ((this.x = this.curve.zero), (this.y = this.curve.one), (this.z = this.curve.one), (this.t = this.curve.zero), (this.zOne = !0))
                  : ((this.x = new a(e, 16)),
                    (this.y = new a(i, 16)),
                    (this.z = r ? new a(r, 16) : this.curve.one),
                    (this.t = n && new a(n, 16)),
                    this.x.red || (this.x = this.x.toRed(this.curve.red)),
                    this.y.red || (this.y = this.y.toRed(this.curve.red)),
                    this.z.red || (this.z = this.z.toRed(this.curve.red)),
                    this.t && !this.t.red && (this.t = this.t.toRed(this.curve.red)),
                    (this.zOne = this.z === this.curve.one),
                    this.curve.extended && !this.t && ((this.t = this.x.redMul(this.y)), this.zOne || (this.t = this.t.redMul(this.z.redInvm()))));
            }
            var n = t("../curve"),
              f = t("../../elliptic"),
              a = t("bn.js"),
              h = t("inherits"),
              s = n.base,
              o = f.utils.assert;
            h(i, s),
              (e.exports = i),
              (i.prototype._mulA = function (t) {
                return this.mOneA ? t.redNeg() : this.a.redMul(t);
              }),
              (i.prototype._mulC = function (t) {
                return this.oneC ? t : this.c.redMul(t);
              }),
              (i.prototype.jpoint = function (t, e, i, r) {
                return this.point(t, e, i, r);
              }),
              (i.prototype.pointFromX = function (t, e) {
                (t = new a(t, 16)), t.red || (t = t.toRed(this.red));
                var i = t.redSqr(),
                  r = this.c2.redSub(this.a.redMul(i)),
                  n = this.one.redSub(this.c2.redMul(this.d).redMul(i)),
                  f = r.redMul(n.redInvm()),
                  h = f.redSqrt();
                if (0 !== h.redSqr().redSub(f).cmp(this.zero)) throw Error("invalid point");
                var s = h.fromRed().isOdd();
                return ((e && !s) || (!e && s)) && (h = h.redNeg()), this.point(t, h);
              }),
              (i.prototype.pointFromY = function (t, e) {
                (t = new a(t, 16)), t.red || (t = t.toRed(this.red));
                var i = t.redSqr(),
                  r = i.redSub(this.c2),
                  n = i.redMul(this.d).redMul(this.c2).redSub(this.a),
                  f = r.redMul(n.redInvm());
                if (0 === f.cmp(this.zero)) {
                  if (e) throw Error("invalid point");
                  return this.point(this.zero, t);
                }
                var h = f.redSqrt();
                if (0 !== h.redSqr().redSub(f).cmp(this.zero)) throw Error("invalid point");
                return h.fromRed().isOdd() !== e && (h = h.redNeg()), this.point(h, t);
              }),
              (i.prototype.validate = function (t) {
                if (t.isInfinity()) return !0;
                t.normalize();
                var e = t.x.redSqr(),
                  i = t.y.redSqr(),
                  r = e.redMul(this.a).redAdd(i),
                  n = this.c2.redMul(this.one.redAdd(this.d.redMul(e).redMul(i)));
                return 0 === r.cmp(n);
              }),
              h(r, s.BasePoint),
              (i.prototype.pointFromJSON = function (t) {
                return r.fromJSON(this, t);
              }),
              (i.prototype.point = function (t, e, i, n) {
                return new r(this, t, e, i, n);
              }),
              (r.fromJSON = function (t, e) {
                return new r(t, e[0], e[1], e[2]);
              }),
              (r.prototype.inspect = function () {
                return this.isInfinity()
                  ? "<EC Point Infinity>"
                  : "<EC Point x: " +
                      this.x.fromRed().toString(16, 2) +
                      " y: " +
                      this.y.fromRed().toString(16, 2) +
                      " z: " +
                      this.z.fromRed().toString(16, 2) +
                      ">";
              }),
              (r.prototype.isInfinity = function () {
                return 0 === this.x.cmpn(0) && (0 === this.y.cmp(this.z) || (this.zOne && 0 === this.y.cmp(this.curve.c)));
              }),
              (r.prototype._extDbl = function () {
                var t = this.x.redSqr(),
                  e = this.y.redSqr(),
                  i = this.z.redSqr();
                i = i.redIAdd(i);
                var r = this.curve._mulA(t),
                  n = this.x.redAdd(this.y).redSqr().redISub(t).redISub(e),
                  f = r.redAdd(e),
                  a = f.redSub(i),
                  h = r.redSub(e),
                  s = n.redMul(a),
                  o = f.redMul(h),
                  d = n.redMul(h),
                  u = a.redMul(f);
                return this.curve.point(s, o, u, d);
              }),
              (r.prototype._projDbl = function () {
                var t,
                  e,
                  i,
                  r = this.x.redAdd(this.y).redSqr(),
                  n = this.x.redSqr(),
                  f = this.y.redSqr();
                if (this.curve.twisted) {
                  var a = this.curve._mulA(n),
                    h = a.redAdd(f);
                  if (this.zOne)
                    (t = r.redSub(n).redSub(f).redMul(h.redSub(this.curve.two))), (e = h.redMul(a.redSub(f))), (i = h.redSqr().redSub(h).redSub(h));
                  else {
                    var s = this.z.redSqr(),
                      o = h.redSub(s).redISub(s);
                    (t = r.redSub(n).redISub(f).redMul(o)), (e = h.redMul(a.redSub(f))), (i = h.redMul(o));
                  }
                } else {
                  var a = n.redAdd(f),
                    s = this.curve._mulC(this.z).redSqr(),
                    o = a.redSub(s).redSub(s);
                  (t = this.curve._mulC(r.redISub(a)).redMul(o)), (e = this.curve._mulC(a).redMul(n.redISub(f))), (i = a.redMul(o));
                }
                return this.curve.point(t, e, i);
              }),
              (r.prototype.dbl = function () {
                return this.isInfinity() ? this : this.curve.extended ? this._extDbl() : this._projDbl();
              }),
              (r.prototype._extAdd = function (t) {
                var e = this.y.redSub(this.x).redMul(t.y.redSub(t.x)),
                  i = this.y.redAdd(this.x).redMul(t.y.redAdd(t.x)),
                  r = this.t.redMul(this.curve.dd).redMul(t.t),
                  n = this.z.redMul(t.z.redAdd(t.z)),
                  f = i.redSub(e),
                  a = n.redSub(r),
                  h = n.redAdd(r),
                  s = i.redAdd(e),
                  o = f.redMul(a),
                  d = h.redMul(s),
                  u = f.redMul(s),
                  c = a.redMul(h);
                return this.curve.point(o, d, c, u);
              }),
              (r.prototype._projAdd = function (t) {
                var e,
                  i,
                  r = this.z.redMul(t.z),
                  n = r.redSqr(),
                  f = this.x.redMul(t.x),
                  a = this.y.redMul(t.y),
                  h = this.curve.d.redMul(f).redMul(a),
                  s = n.redSub(h),
                  o = n.redAdd(h),
                  d = this.x.redAdd(this.y).redMul(t.x.redAdd(t.y)).redISub(f).redISub(a),
                  u = r.redMul(s).redMul(d);
                return (
                  this.curve.twisted
                    ? ((e = r.redMul(o).redMul(a.redSub(this.curve._mulA(f)))), (i = s.redMul(o)))
                    : ((e = r.redMul(o).redMul(a.redSub(f))), (i = this.curve._mulC(s).redMul(o))),
                  this.curve.point(u, e, i)
                );
              }),
              (r.prototype.add = function (t) {
                return this.isInfinity() ? t : t.isInfinity() ? this : this.curve.extended ? this._extAdd(t) : this._projAdd(t);
              }),
              (r.prototype.mul = function (t) {
                return this._hasDoubles(t) ? this.curve._fixedNafMul(this, t) : this.curve._wnafMul(this, t);
              }),
              (r.prototype.mulAdd = function (t, e, i) {
                return this.curve._wnafMulAdd(1, [this, e], [t, i], 2, !1);
              }),
              (r.prototype.jmulAdd = function (t, e, i) {
                return this.curve._wnafMulAdd(1, [this, e], [t, i], 2, !0);
              }),
              (r.prototype.normalize = function () {
                if (this.zOne) return this;
                var t = this.z.redInvm();
                return (
                  (this.x = this.x.redMul(t)),
                  (this.y = this.y.redMul(t)),
                  this.t && (this.t = this.t.redMul(t)),
                  (this.z = this.curve.one),
                  (this.zOne = !0),
                  this
                );
              }),
              (r.prototype.neg = function () {
                return this.curve.point(this.x.redNeg(), this.y, this.z, this.t && this.t.redNeg());
              }),
              (r.prototype.getX = function () {
                return this.normalize(), this.x.fromRed();
              }),
              (r.prototype.getY = function () {
                return this.normalize(), this.y.fromRed();
              }),
              (r.prototype.eq = function (t) {
                return this === t || (0 === this.getX().cmp(t.getX()) && 0 === this.getY().cmp(t.getY()));
              }),
              (r.prototype.eqXToP = function (t) {
                var e = t.toRed(this.curve.red).redMul(this.z);
                if (0 === this.x.cmp(e)) return !0;
                for (var i = t.clone(), r = this.curve.redN.redMul(this.z); ; ) {
                  if ((i.iadd(this.curve.n), i.cmp(this.curve.p) >= 0)) return !1;
                  if ((e.redIAdd(r), 0 === this.x.cmp(e))) return !0;
                }
              }),
              (r.prototype.toP = r.prototype.normalize),
              (r.prototype.mixedAdd = r.prototype.add);
          },
          { "../../elliptic": 1, "../curve": 4, "bn.js": 16, inherits: 27 },
        ],
        4: [
          function (t, e, i) {
            "use strict";
            var r = i;
            (r.base = t("./base")), (r.short = t("./short")), (r.mont = t("./mont")), (r.edwards = t("./edwards"));
          },
          { "./base": 2, "./edwards": 3, "./mont": 5, "./short": 6 },
        ],
        5: [
          function (t, e) {
            "use strict";
            function i(t) {
              h.call(this, "mont", t),
                (this.a = new f(t.a, 16).toRed(this.red)),
                (this.b = new f(t.b, 16).toRed(this.red)),
                (this.i4 = new f(4).toRed(this.red).redInvm()),
                (this.two = new f(2).toRed(this.red)),
                (this.a24 = this.i4.redMul(this.a.redAdd(this.two)));
            }
            function r(t, e, i) {
              h.BasePoint.call(this, t, "projective"),
                null === e && null === i
                  ? ((this.x = this.curve.one), (this.z = this.curve.zero))
                  : ((this.x = new f(e, 16)),
                    (this.z = new f(i, 16)),
                    this.x.red || (this.x = this.x.toRed(this.curve.red)),
                    this.z.red || (this.z = this.z.toRed(this.curve.red)));
            }
            var n = t("../curve"),
              f = t("bn.js"),
              a = t("inherits"),
              h = n.base,
              s = t("../../elliptic"),
              o = s.utils;
            a(i, h),
              (e.exports = i),
              (i.prototype.validate = function (t) {
                var e = t.normalize().x,
                  i = e.redSqr(),
                  r = i.redMul(e).redAdd(i.redMul(this.a)).redAdd(e),
                  n = r.redSqrt();
                return 0 === n.redSqr().cmp(r);
              }),
              a(r, h.BasePoint),
              (i.prototype.decodePoint = function (t, e) {
                return this.point(o.toArray(t, e), 1);
              }),
              (i.prototype.point = function (t, e) {
                return new r(this, t, e);
              }),
              (i.prototype.pointFromJSON = function (t) {
                return r.fromJSON(this, t);
              }),
              (r.prototype.precompute = function () {}),
              (r.prototype._encode = function () {
                return this.getX().toArray("be", this.curve.p.byteLength());
              }),
              (r.fromJSON = function (t, e) {
                return new r(t, e[0], e[1] || t.one);
              }),
              (r.prototype.inspect = function () {
                return this.isInfinity()
                  ? "<EC Point Infinity>"
                  : "<EC Point x: " + this.x.fromRed().toString(16, 2) + " z: " + this.z.fromRed().toString(16, 2) + ">";
              }),
              (r.prototype.isInfinity = function () {
                return 0 === this.z.cmpn(0);
              }),
              (r.prototype.dbl = function () {
                var t = this.x.redAdd(this.z),
                  e = t.redSqr(),
                  i = this.x.redSub(this.z),
                  r = i.redSqr(),
                  n = e.redSub(r),
                  f = e.redMul(r),
                  a = n.redMul(r.redAdd(this.curve.a24.redMul(n)));
                return this.curve.point(f, a);
              }),
              (r.prototype.add = function () {
                throw Error("Not supported on Montgomery curve");
              }),
              (r.prototype.diffAdd = function (t, e) {
                var i = this.x.redAdd(this.z),
                  r = this.x.redSub(this.z),
                  n = t.x.redAdd(t.z),
                  f = t.x.redSub(t.z),
                  a = f.redMul(i),
                  h = n.redMul(r),
                  s = e.z.redMul(a.redAdd(h).redSqr()),
                  o = e.x.redMul(a.redISub(h).redSqr());
                return this.curve.point(s, o);
              }),
              (r.prototype.mul = function (t) {
                for (var e = t.clone(), i = this, r = this.curve.point(null, null), n = this, f = []; 0 !== e.cmpn(0); e.iushrn(1))
                  f.push(e.andln(1));
                for (var a = f.length - 1; a >= 0; a--) 0 === f[a] ? ((i = i.diffAdd(r, n)), (r = r.dbl())) : ((r = i.diffAdd(r, n)), (i = i.dbl()));
                return r;
              }),
              (r.prototype.mulAdd = function () {
                throw Error("Not supported on Montgomery curve");
              }),
              (r.prototype.jumlAdd = function () {
                throw Error("Not supported on Montgomery curve");
              }),
              (r.prototype.eq = function (t) {
                return 0 === this.getX().cmp(t.getX());
              }),
              (r.prototype.normalize = function () {
                return (this.x = this.x.redMul(this.z.redInvm())), (this.z = this.curve.one), this;
              }),
              (r.prototype.getX = function () {
                return this.normalize(), this.x.fromRed();
              });
          },
          { "../../elliptic": 1, "../curve": 4, "bn.js": 16, inherits: 27 },
        ],
        6: [
          function (t, e) {
            "use strict";
            function i(t) {
              o.call(this, "short", t),
                (this.a = new h(t.a, 16).toRed(this.red)),
                (this.b = new h(t.b, 16).toRed(this.red)),
                (this.tinv = this.two.redInvm()),
                (this.zeroA = 0 === this.a.fromRed().cmpn(0)),
                (this.threeA = 0 === this.a.fromRed().sub(this.p).cmpn(-3)),
                (this.endo = this._getEndomorphism(t)),
                (this._endoWnafT1 = Array(4)),
                (this._endoWnafT2 = Array(4));
            }
            function r(t, e, i, r) {
              o.BasePoint.call(this, t, "affine"),
                null === e && null === i
                  ? ((this.x = null), (this.y = null), (this.inf = !0))
                  : ((this.x = new h(e, 16)),
                    (this.y = new h(i, 16)),
                    r && (this.x.forceRed(this.curve.red), this.y.forceRed(this.curve.red)),
                    this.x.red || (this.x = this.x.toRed(this.curve.red)),
                    this.y.red || (this.y = this.y.toRed(this.curve.red)),
                    (this.inf = !1));
            }
            function n(t, e, i, r) {
              o.BasePoint.call(this, t, "jacobian"),
                null === e && null === i && null === r
                  ? ((this.x = this.curve.one), (this.y = this.curve.one), (this.z = new h(0)))
                  : ((this.x = new h(e, 16)), (this.y = new h(i, 16)), (this.z = new h(r, 16))),
                this.x.red || (this.x = this.x.toRed(this.curve.red)),
                this.y.red || (this.y = this.y.toRed(this.curve.red)),
                this.z.red || (this.z = this.z.toRed(this.curve.red)),
                (this.zOne = this.z === this.curve.one);
            }
            var f = t("../curve"),
              a = t("../../elliptic"),
              h = t("bn.js"),
              s = t("inherits"),
              o = f.base,
              d = a.utils.assert;
            s(i, o),
              (e.exports = i),
              (i.prototype._getEndomorphism = function (t) {
                if (this.zeroA && this.g && this.n && 1 === this.p.modn(3)) {
                  var e, i;
                  if (t.beta) e = new h(t.beta, 16).toRed(this.red);
                  else {
                    var r = this._getEndoRoots(this.p);
                    (e = 0 > r[0].cmp(r[1]) ? r[0] : r[1]), (e = e.toRed(this.red));
                  }
                  if (t.lambda) i = new h(t.lambda, 16);
                  else {
                    var n = this._getEndoRoots(this.n);
                    0 === this.g.mul(n[0]).x.cmp(this.g.x.redMul(e)) ? (i = n[0]) : ((i = n[1]), d(0 === this.g.mul(i).x.cmp(this.g.x.redMul(e))));
                  }
                  var f;
                  return (
                    (f = t.basis
                      ? t.basis.map(function (t) {
                          return { a: new h(t.a, 16), b: new h(t.b, 16) };
                        })
                      : this._getEndoBasis(i)),
                    { beta: e, lambda: i, basis: f }
                  );
                }
              }),
              (i.prototype._getEndoRoots = function (t) {
                var e = t === this.p ? this.red : h.mont(t),
                  i = new h(2).toRed(e).redInvm(),
                  r = i.redNeg(),
                  n = new h(3).toRed(e).redNeg().redSqrt().redMul(i),
                  f = r.redAdd(n).fromRed(),
                  a = r.redSub(n).fromRed();
                return [f, a];
              }),
              (i.prototype._getEndoBasis = function (t) {
                for (
                  var e,
                    i,
                    r,
                    n,
                    f,
                    a,
                    s,
                    o,
                    d,
                    u = this.n.ushrn(Math.floor(this.n.bitLength() / 2)),
                    c = t,
                    l = this.n.clone(),
                    b = new h(1),
                    p = new h(0),
                    m = new h(0),
                    v = new h(1),
                    y = 0;
                  0 !== c.cmpn(0);

                ) {
                  var g = l.div(c);
                  (o = l.sub(g.mul(c))), (d = m.sub(g.mul(b)));
                  var M = v.sub(g.mul(p));
                  if (!r && 0 > o.cmp(u)) (e = s.neg()), (i = b), (r = o.neg()), (n = d);
                  else if (r && 2 === ++y) break;
                  (s = o), (l = c), (c = o), (m = b), (b = d), (v = p), (p = M);
                }
                (f = o.neg()), (a = d);
                var w = r.sqr().add(n.sqr()),
                  _ = f.sqr().add(a.sqr());
                return (
                  _.cmp(w) >= 0 && ((f = e), (a = i)),
                  r.negative && ((r = r.neg()), (n = n.neg())),
                  f.negative && ((f = f.neg()), (a = a.neg())),
                  [
                    { a: r, b: n },
                    { a: f, b: a },
                  ]
                );
              }),
              (i.prototype._endoSplit = function (t) {
                var e = this.endo.basis,
                  i = e[0],
                  r = e[1],
                  n = r.b.mul(t).divRound(this.n),
                  f = i.b.neg().mul(t).divRound(this.n),
                  a = n.mul(i.a),
                  h = f.mul(r.a),
                  s = n.mul(i.b),
                  o = f.mul(r.b),
                  d = t.sub(a).sub(h),
                  u = s.add(o).neg();
                return { k1: d, k2: u };
              }),
              (i.prototype.pointFromX = function (t, e) {
                (t = new h(t, 16)), t.red || (t = t.toRed(this.red));
                var i = t.redSqr().redMul(t).redIAdd(t.redMul(this.a)).redIAdd(this.b),
                  r = i.redSqrt();
                if (0 !== r.redSqr().redSub(i).cmp(this.zero)) throw Error("invalid point");
                var n = r.fromRed().isOdd();
                return ((e && !n) || (!e && n)) && (r = r.redNeg()), this.point(t, r);
              }),
              (i.prototype.validate = function (t) {
                if (t.inf) return !0;
                var e = t.x,
                  i = t.y,
                  r = this.a.redMul(e),
                  n = e.redSqr().redMul(e).redIAdd(r).redIAdd(this.b);
                return 0 === i.redSqr().redISub(n).cmpn(0);
              }),
              (i.prototype._endoWnafMulAdd = function (t, e, i) {
                for (var r = this._endoWnafT1, n = this._endoWnafT2, f = 0; t.length > f; f++) {
                  var a = this._endoSplit(e[f]),
                    h = t[f],
                    s = h._getBeta();
                  a.k1.negative && (a.k1.ineg(), (h = h.neg(!0))),
                    a.k2.negative && (a.k2.ineg(), (s = s.neg(!0))),
                    (r[2 * f] = h),
                    (r[2 * f + 1] = s),
                    (n[2 * f] = a.k1),
                    (n[2 * f + 1] = a.k2);
                }
                for (var o = this._wnafMulAdd(1, r, n, 2 * f, i), d = 0; 2 * f > d; d++) (r[d] = null), (n[d] = null);
                return o;
              }),
              s(r, o.BasePoint),
              (i.prototype.point = function (t, e, i) {
                return new r(this, t, e, i);
              }),
              (i.prototype.pointFromJSON = function (t, e) {
                return r.fromJSON(this, t, e);
              }),
              (r.prototype._getBeta = function () {
                if (this.curve.endo) {
                  var t = this.precomputed;
                  if (t && t.beta) return t.beta;
                  var e = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
                  if (t) {
                    var i = this.curve,
                      r = function (t) {
                        return i.point(t.x.redMul(i.endo.beta), t.y);
                      };
                    (t.beta = e),
                      (e.precomputed = {
                        beta: null,
                        naf: t.naf && { wnd: t.naf.wnd, points: t.naf.points.map(r) },
                        doubles: t.doubles && { step: t.doubles.step, points: t.doubles.points.map(r) },
                      });
                  }
                  return e;
                }
              }),
              (r.prototype.toJSON = function () {
                return this.precomputed
                  ? [
                      this.x,
                      this.y,
                      this.precomputed && {
                        doubles: this.precomputed.doubles && {
                          step: this.precomputed.doubles.step,
                          points: this.precomputed.doubles.points.slice(1),
                        },
                        naf: this.precomputed.naf && { wnd: this.precomputed.naf.wnd, points: this.precomputed.naf.points.slice(1) },
                      },
                    ]
                  : [this.x, this.y];
              }),
              (r.fromJSON = function (t, e, i) {
                function r(e) {
                  return t.point(e[0], e[1], i);
                }
                "string" == typeof e && (e = JSON.parse(e));
                var n = t.point(e[0], e[1], i);
                if (!e[2]) return n;
                var f = e[2];
                return (
                  (n.precomputed = {
                    beta: null,
                    doubles: f.doubles && { step: f.doubles.step, points: [n].concat(f.doubles.points.map(r)) },
                    naf: f.naf && { wnd: f.naf.wnd, points: [n].concat(f.naf.points.map(r)) },
                  }),
                  n
                );
              }),
              (r.prototype.inspect = function () {
                return this.isInfinity()
                  ? "<EC Point Infinity>"
                  : "<EC Point x: " + this.x.fromRed().toString(16, 2) + " y: " + this.y.fromRed().toString(16, 2) + ">";
              }),
              (r.prototype.isInfinity = function () {
                return this.inf;
              }),
              (r.prototype.add = function (t) {
                if (this.inf) return t;
                if (t.inf) return this;
                if (this.eq(t)) return this.dbl();
                if (this.neg().eq(t)) return this.curve.point(null, null);
                if (0 === this.x.cmp(t.x)) return this.curve.point(null, null);
                var e = this.y.redSub(t.y);
                0 !== e.cmpn(0) && (e = e.redMul(this.x.redSub(t.x).redInvm()));
                var i = e.redSqr().redISub(this.x).redISub(t.x),
                  r = e.redMul(this.x.redSub(i)).redISub(this.y);
                return this.curve.point(i, r);
              }),
              (r.prototype.dbl = function () {
                if (this.inf) return this;
                var t = this.y.redAdd(this.y);
                if (0 === t.cmpn(0)) return this.curve.point(null, null);
                var e = this.curve.a,
                  i = this.x.redSqr(),
                  r = t.redInvm(),
                  n = i.redAdd(i).redIAdd(i).redIAdd(e).redMul(r),
                  f = n.redSqr().redISub(this.x.redAdd(this.x)),
                  a = n.redMul(this.x.redSub(f)).redISub(this.y);
                return this.curve.point(f, a);
              }),
              (r.prototype.getX = function () {
                return this.x.fromRed();
              }),
              (r.prototype.getY = function () {
                return this.y.fromRed();
              }),
              (r.prototype.mul = function (t) {
                return (
                  (t = new h(t, 16)),
                  this._hasDoubles(t)
                    ? this.curve._fixedNafMul(this, t)
                    : this.curve.endo
                    ? this.curve._endoWnafMulAdd([this], [t])
                    : this.curve._wnafMul(this, t)
                );
              }),
              (r.prototype.mulAdd = function (t, e, i) {
                var r = [this, e],
                  n = [t, i];
                return this.curve.endo ? this.curve._endoWnafMulAdd(r, n) : this.curve._wnafMulAdd(1, r, n, 2);
              }),
              (r.prototype.jmulAdd = function (t, e, i) {
                var r = [this, e],
                  n = [t, i];
                return this.curve.endo ? this.curve._endoWnafMulAdd(r, n, !0) : this.curve._wnafMulAdd(1, r, n, 2, !0);
              }),
              (r.prototype.eq = function (t) {
                return this === t || (this.inf === t.inf && (this.inf || (0 === this.x.cmp(t.x) && 0 === this.y.cmp(t.y))));
              }),
              (r.prototype.neg = function (t) {
                if (this.inf) return this;
                var e = this.curve.point(this.x, this.y.redNeg());
                if (t && this.precomputed) {
                  var i = this.precomputed,
                    r = function (t) {
                      return t.neg();
                    };
                  e.precomputed = {
                    naf: i.naf && { wnd: i.naf.wnd, points: i.naf.points.map(r) },
                    doubles: i.doubles && { step: i.doubles.step, points: i.doubles.points.map(r) },
                  };
                }
                return e;
              }),
              (r.prototype.toJ = function () {
                if (this.inf) return this.curve.jpoint(null, null, null);
                var t = this.curve.jpoint(this.x, this.y, this.curve.one);
                return t;
              }),
              s(n, o.BasePoint),
              (i.prototype.jpoint = function (t, e, i) {
                return new n(this, t, e, i);
              }),
              (n.prototype.toP = function () {
                if (this.isInfinity()) return this.curve.point(null, null);
                var t = this.z.redInvm(),
                  e = t.redSqr(),
                  i = this.x.redMul(e),
                  r = this.y.redMul(e).redMul(t);
                return this.curve.point(i, r);
              }),
              (n.prototype.neg = function () {
                return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
              }),
              (n.prototype.add = function (t) {
                if (this.isInfinity()) return t;
                if (t.isInfinity()) return this;
                var e = t.z.redSqr(),
                  i = this.z.redSqr(),
                  r = this.x.redMul(e),
                  n = t.x.redMul(i),
                  f = this.y.redMul(e.redMul(t.z)),
                  a = t.y.redMul(i.redMul(this.z)),
                  h = r.redSub(n),
                  s = f.redSub(a);
                if (0 === h.cmpn(0)) return 0 !== s.cmpn(0) ? this.curve.jpoint(null, null, null) : this.dbl();
                var o = h.redSqr(),
                  d = o.redMul(h),
                  u = r.redMul(o),
                  c = s.redSqr().redIAdd(d).redISub(u).redISub(u),
                  l = s.redMul(u.redISub(c)).redISub(f.redMul(d)),
                  b = this.z.redMul(t.z).redMul(h);
                return this.curve.jpoint(c, l, b);
              }),
              (n.prototype.mixedAdd = function (t) {
                if (this.isInfinity()) return t.toJ();
                if (t.isInfinity()) return this;
                var e = this.z.redSqr(),
                  i = this.x,
                  r = t.x.redMul(e),
                  n = this.y,
                  f = t.y.redMul(e).redMul(this.z),
                  a = i.redSub(r),
                  h = n.redSub(f);
                if (0 === a.cmpn(0)) return 0 !== h.cmpn(0) ? this.curve.jpoint(null, null, null) : this.dbl();
                var s = a.redSqr(),
                  o = s.redMul(a),
                  d = i.redMul(s),
                  u = h.redSqr().redIAdd(o).redISub(d).redISub(d),
                  c = h.redMul(d.redISub(u)).redISub(n.redMul(o)),
                  l = this.z.redMul(a);
                return this.curve.jpoint(u, c, l);
              }),
              (n.prototype.dblp = function (t) {
                if (0 === t) return this;
                if (this.isInfinity()) return this;
                if (!t) return this.dbl();
                if (this.curve.zeroA || this.curve.threeA) {
                  for (var e = this, i = 0; t > i; i++) e = e.dbl();
                  return e;
                }
                for (
                  var r = this.curve.a, n = this.curve.tinv, f = this.x, a = this.y, h = this.z, s = h.redSqr().redSqr(), o = a.redAdd(a), i = 0;
                  t > i;
                  i++
                ) {
                  var d = f.redSqr(),
                    u = o.redSqr(),
                    c = u.redSqr(),
                    l = d.redAdd(d).redIAdd(d).redIAdd(r.redMul(s)),
                    b = f.redMul(u),
                    p = l.redSqr().redISub(b.redAdd(b)),
                    m = b.redISub(p),
                    v = l.redMul(m);
                  v = v.redIAdd(v).redISub(c);
                  var y = o.redMul(h);
                  t > i + 1 && (s = s.redMul(c)), (f = p), (h = y), (o = v);
                }
                return this.curve.jpoint(f, o.redMul(n), h);
              }),
              (n.prototype.dbl = function () {
                return this.isInfinity() ? this : this.curve.zeroA ? this._zeroDbl() : this.curve.threeA ? this._threeDbl() : this._dbl();
              }),
              (n.prototype._zeroDbl = function () {
                var t, e, i;
                if (this.zOne) {
                  var r = this.x.redSqr(),
                    n = this.y.redSqr(),
                    f = n.redSqr(),
                    a = this.x.redAdd(n).redSqr().redISub(r).redISub(f);
                  a = a.redIAdd(a);
                  var h = r.redAdd(r).redIAdd(r),
                    s = h.redSqr().redISub(a).redISub(a),
                    o = f.redIAdd(f);
                  (o = o.redIAdd(o)), (o = o.redIAdd(o)), (t = s), (e = h.redMul(a.redISub(s)).redISub(o)), (i = this.y.redAdd(this.y));
                } else {
                  var d = this.x.redSqr(),
                    u = this.y.redSqr(),
                    c = u.redSqr(),
                    l = this.x.redAdd(u).redSqr().redISub(d).redISub(c);
                  l = l.redIAdd(l);
                  var b = d.redAdd(d).redIAdd(d),
                    p = b.redSqr(),
                    m = c.redIAdd(c);
                  (m = m.redIAdd(m)),
                    (m = m.redIAdd(m)),
                    (t = p.redISub(l).redISub(l)),
                    (e = b.redMul(l.redISub(t)).redISub(m)),
                    (i = this.y.redMul(this.z)),
                    (i = i.redIAdd(i));
                }
                return this.curve.jpoint(t, e, i);
              }),
              (n.prototype._threeDbl = function () {
                var t, e, i;
                if (this.zOne) {
                  var r = this.x.redSqr(),
                    n = this.y.redSqr(),
                    f = n.redSqr(),
                    a = this.x.redAdd(n).redSqr().redISub(r).redISub(f);
                  a = a.redIAdd(a);
                  var h = r.redAdd(r).redIAdd(r).redIAdd(this.curve.a),
                    s = h.redSqr().redISub(a).redISub(a);
                  t = s;
                  var o = f.redIAdd(f);
                  (o = o.redIAdd(o)), (o = o.redIAdd(o)), (e = h.redMul(a.redISub(s)).redISub(o)), (i = this.y.redAdd(this.y));
                } else {
                  var d = this.z.redSqr(),
                    u = this.y.redSqr(),
                    c = this.x.redMul(u),
                    l = this.x.redSub(d).redMul(this.x.redAdd(d));
                  l = l.redAdd(l).redIAdd(l);
                  var b = c.redIAdd(c);
                  b = b.redIAdd(b);
                  var p = b.redAdd(b);
                  (t = l.redSqr().redISub(p)), (i = this.y.redAdd(this.z).redSqr().redISub(u).redISub(d));
                  var m = u.redSqr();
                  (m = m.redIAdd(m)), (m = m.redIAdd(m)), (m = m.redIAdd(m)), (e = l.redMul(b.redISub(t)).redISub(m));
                }
                return this.curve.jpoint(t, e, i);
              }),
              (n.prototype._dbl = function () {
                var t = this.curve.a,
                  e = this.x,
                  i = this.y,
                  r = this.z,
                  n = r.redSqr().redSqr(),
                  f = e.redSqr(),
                  a = i.redSqr(),
                  h = f.redAdd(f).redIAdd(f).redIAdd(t.redMul(n)),
                  s = e.redAdd(e);
                s = s.redIAdd(s);
                var o = s.redMul(a),
                  d = h.redSqr().redISub(o.redAdd(o)),
                  u = o.redISub(d),
                  c = a.redSqr();
                (c = c.redIAdd(c)), (c = c.redIAdd(c)), (c = c.redIAdd(c));
                var l = h.redMul(u).redISub(c),
                  b = i.redAdd(i).redMul(r);
                return this.curve.jpoint(d, l, b);
              }),
              (n.prototype.trpl = function () {
                if (!this.curve.zeroA) return this.dbl().add(this);
                var t = this.x.redSqr(),
                  e = this.y.redSqr(),
                  i = this.z.redSqr(),
                  r = e.redSqr(),
                  n = t.redAdd(t).redIAdd(t),
                  f = n.redSqr(),
                  a = this.x.redAdd(e).redSqr().redISub(t).redISub(r);
                (a = a.redIAdd(a)), (a = a.redAdd(a).redIAdd(a)), (a = a.redISub(f));
                var h = a.redSqr(),
                  s = r.redIAdd(r);
                (s = s.redIAdd(s)), (s = s.redIAdd(s)), (s = s.redIAdd(s));
                var o = n.redIAdd(a).redSqr().redISub(f).redISub(h).redISub(s),
                  d = e.redMul(o);
                (d = d.redIAdd(d)), (d = d.redIAdd(d));
                var u = this.x.redMul(h).redISub(d);
                (u = u.redIAdd(u)), (u = u.redIAdd(u));
                var c = this.y.redMul(o.redMul(s.redISub(o)).redISub(a.redMul(h)));
                (c = c.redIAdd(c)), (c = c.redIAdd(c)), (c = c.redIAdd(c));
                var l = this.z.redAdd(a).redSqr().redISub(i).redISub(h);
                return this.curve.jpoint(u, c, l);
              }),
              (n.prototype.mul = function (t, e) {
                return (t = new h(t, e)), this.curve._wnafMul(this, t);
              }),
              (n.prototype.eq = function (t) {
                if ("affine" === t.type) return this.eq(t.toJ());
                if (this === t) return !0;
                var e = this.z.redSqr(),
                  i = t.z.redSqr();
                if (0 !== this.x.redMul(i).redISub(t.x.redMul(e)).cmpn(0)) return !1;
                var r = e.redMul(this.z),
                  n = i.redMul(t.z);
                return 0 === this.y.redMul(n).redISub(t.y.redMul(r)).cmpn(0);
              }),
              (n.prototype.eqXToP = function (t) {
                var e = this.z.redSqr(),
                  i = t.toRed(this.curve.red).redMul(e);
                if (0 === this.x.cmp(i)) return !0;
                for (var r = t.clone(), n = this.curve.redN.redMul(e); ; ) {
                  if ((r.iadd(this.curve.n), r.cmp(this.curve.p) >= 0)) return !1;
                  if ((i.redIAdd(n), 0 === this.x.cmp(i))) return !0;
                }
              }),
              (n.prototype.inspect = function () {
                return this.isInfinity()
                  ? "<EC JPoint Infinity>"
                  : "<EC JPoint x: " + this.x.toString(16, 2) + " y: " + this.y.toString(16, 2) + " z: " + this.z.toString(16, 2) + ">";
              }),
              (n.prototype.isInfinity = function () {
                return 0 === this.z.cmpn(0);
              });
          },
          { "../../elliptic": 1, "../curve": 4, "bn.js": 16, inherits: 27 },
        ],
        7: [
          function (t, e, i) {
            "use strict";
            function r(t) {
              (this.curve = "short" === t.type ? new h.curve.short(t) : "edwards" === t.type ? new h.curve.edwards(t) : new h.curve.mont(t)),
                (this.g = this.curve.g),
                (this.n = this.curve.n),
                (this.hash = t.hash),
                s(this.g.validate(), "Invalid curve"),
                s(this.g.mul(this.n).isInfinity(), "Invalid curve, G*N != O");
            }
            function n(t, e) {
              Object.defineProperty(f, t, {
                configurable: !0,
                enumerable: !0,
                get: function () {
                  var i = new r(e);
                  return Object.defineProperty(f, t, { configurable: !0, enumerable: !0, value: i }), i;
                },
              });
            }
            var f = i,
              a = t("hash.js"),
              h = t("../elliptic"),
              s = h.utils.assert;
            (f.PresetCurve = r),
              n("p192", {
                type: "short",
                prime: "p192",
                p: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff",
                a: "ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc",
                b: "64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1",
                n: "ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831",
                hash: a.sha256,
                gRed: !1,
                g: ["188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012", "07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811"],
              }),
              n("p224", {
                type: "short",
                prime: "p224",
                p: "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001",
                a: "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe",
                b: "b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4",
                n: "ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d",
                hash: a.sha256,
                gRed: !1,
                g: [
                  "b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21",
                  "bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34",
                ],
              }),
              n("p256", {
                type: "short",
                prime: null,
                p: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff",
                a: "ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc",
                b: "5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b",
                n: "ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551",
                hash: a.sha256,
                gRed: !1,
                g: [
                  "6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296",
                  "4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5",
                ],
              }),
              n("p384", {
                type: "short",
                prime: null,
                p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 ffffffff",
                a: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe ffffffff 00000000 00000000 fffffffc",
                b: "b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f 5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef",
                n: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 f4372ddf 581a0db2 48b0a77a ecec196a ccc52973",
                hash: a.sha384,
                gRed: !1,
                g: [
                  "aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 5502f25d bf55296c 3a545e38 72760ab7",
                  "3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 0a60b1ce 1d7e819d 7a431d7c 90ea0e5f",
                ],
              }),
              n("p521", {
                type: "short",
                prime: null,
                p: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff",
                a: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffc",
                b: "00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b 99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd 3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00",
                n: "000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409",
                hash: a.sha512,
                gRed: !1,
                g: [
                  "000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66",
                  "00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 3fad0761 353c7086 a272c240 88be9476 9fd16650",
                ],
              }),
              n("curve25519", {
                type: "mont",
                prime: "p25519",
                p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
                a: "76d06",
                b: "1",
                n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
                hash: a.sha256,
                gRed: !1,
                g: ["9"],
              }),
              n("ed25519", {
                type: "edwards",
                prime: "p25519",
                p: "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed",
                a: "-1",
                c: "1",
                d: "52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3",
                n: "1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed",
                hash: a.sha256,
                gRed: !1,
                g: [
                  "216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a",
                  "6666666666666666666666666666666666666666666666666666666666666658",
                ],
              });
            var o;
            try {
              o = t("./precomputed/secp256k1");
            } catch (d) {
              o = void 0;
            }
            n("secp256k1", {
              type: "short",
              prime: "k256",
              p: "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f",
              a: "0",
              b: "7",
              n: "ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141",
              h: "1",
              hash: a.sha256,
              beta: "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
              lambda: "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
              basis: [
                { a: "3086d221a7d46bcde86c90e49284eb15", b: "-e4437ed6010e88286f547fa90abfe4c3" },
                { a: "114ca50f7a8e2f3f657c1108d9d44cfd8", b: "3086d221a7d46bcde86c90e49284eb15" },
              ],
              gRed: !1,
              g: [
                "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
                "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",
                o,
              ],
            });
          },
          { "../elliptic": 1, "./precomputed/secp256k1": 14, "hash.js": 19 },
        ],
        8: [
          function (t, e) {
            "use strict";
            function i(t) {
              return this instanceof i
                ? ("string" == typeof t && (h(f.curves.hasOwnProperty(t), "Unknown curve " + t), (t = f.curves[t])),
                  t instanceof f.curves.PresetCurve && (t = { curve: t }),
                  (this.curve = t.curve.curve),
                  (this.n = this.curve.n),
                  (this.nh = this.n.ushrn(1)),
                  (this.g = this.curve.g),
                  (this.g = t.curve.g),
                  this.g.precompute(t.curve.n.bitLength() + 1),
                  (this.hash = t.hash || t.curve.hash),
                  void 0)
                : new i(t);
            }
            var r = t("bn.js"),
              n = t("hmac-drbg"),
              f = t("../../elliptic"),
              a = f.utils,
              h = a.assert,
              s = t("./key"),
              o = t("./signature");
            (e.exports = i),
              (i.prototype.keyPair = function (t) {
                return new s(this, t);
              }),
              (i.prototype.keyFromPrivate = function (t, e) {
                return s.fromPrivate(this, t, e);
              }),
              (i.prototype.keyFromPublic = function (t, e) {
                return s.fromPublic(this, t, e);
              }),
              (i.prototype.genKeyPair = function (t, e) {
                e || (e = {});
                for (
                  var i = new n({
                      hash: this.hash,
                      pers: e.pers,
                      persEnc: e.persEnc || "utf8",
                      entropy: e.entropy || f.rand(this.hash.hmacStrength),
                      entropyEnc: (e.entropy && e.entropyEnc) || "utf8",
                      nonce: this.n.toArray(),
                    }),
                    a = this.n.byteLength(),
                    h = this.n.sub(new r(2));
                  ;

                ) {
                  var s = new r(i.generate(a, t));
                  if (!(s.cmp(h) > 0)) return s.iaddn(1), this.keyFromPrivate(s);
                }
              }),
              (i.prototype._truncateToN = function (t, e) {
                var i = 8 * t.byteLength() - this.n.bitLength();
                return i > 0 && (t = t.ushrn(i)), !e && t.cmp(this.n) >= 0 ? t.sub(this.n) : t;
              }),
              (i.prototype.sign = function (t, e, i, f) {
                "object" == typeof i && ((f = i), (i = null)), f || (f = {}), (e = this.keyFromPrivate(e, i)), (t = this._truncateToN(new r(t, 16)));
                for (
                  var a = this.n.byteLength(),
                    h = e.getPrivate().toArray("be", a),
                    s = t.toArray("be", a),
                    d = new n({ hash: this.hash, entropy: h, nonce: s, pers: f.pers, persEnc: f.persEnc || "utf8" }),
                    u = this.n.sub(new r(1)),
                    c = 0;
                  !0;
                  c++
                ) {
                  var l = f.k ? f.k(c) : new r(d.generate(this.n.byteLength()));
                  if (((l = this._truncateToN(l, !0)), !(0 >= l.cmpn(1) || l.cmp(u) >= 0))) {
                    var b = this.g.mul(l);
                    if (!b.isInfinity()) {
                      var p = b.getX(),
                        m = p.umod(this.n);
                      if (0 !== m.cmpn(0)) {
                        var v = l.invm(this.n).mul(m.mul(e.getPrivate()).iadd(t));
                        if (((v = v.umod(this.n)), 0 !== v.cmpn(0))) {
                          var y = (b.getY().isOdd() ? 1 : 0) | (0 !== p.cmp(m) ? 2 : 0);
                          return f.canonical && v.cmp(this.nh) > 0 && ((v = this.n.sub(v)), (y ^= 1)), new o({ r: m, s: v, recoveryParam: y });
                        }
                      }
                    }
                  }
                }
              }),
              (i.prototype.verify = function (t, e, i, n) {
                (t = this._truncateToN(new r(t, 16))), (i = this.keyFromPublic(i, n)), (e = new o(e, "hex"));
                var f = e.r,
                  a = e.s;
                if (0 > f.cmpn(1) || f.cmp(this.n) >= 0) return !1;
                if (0 > a.cmpn(1) || a.cmp(this.n) >= 0) return !1;
                var h = a.invm(this.n),
                  s = h.mul(t).umod(this.n),
                  d = h.mul(f).umod(this.n);
                if (!this.curve._maxwellTrick) {
                  var u = this.g.mulAdd(s, i.getPublic(), d);
                  return u.isInfinity() ? !1 : 0 === u.getX().umod(this.n).cmp(f);
                }
                var u = this.g.jmulAdd(s, i.getPublic(), d);
                return u.isInfinity() ? !1 : u.eqXToP(f);
              }),
              (i.prototype.recoverPubKey = function (t, e, i, n) {
                h((3 & i) === i, "The recovery param is more than two bits"), (e = new o(e, n));
                var f = this.n,
                  a = new r(t),
                  s = e.r,
                  d = e.s,
                  u = 1 & i,
                  c = i >> 1;
                if (s.cmp(this.curve.p.umod(this.curve.n)) >= 0 && c) throw Error("Unable to find sencond key candinate");
                s = c ? this.curve.pointFromX(s.add(this.curve.n), u) : this.curve.pointFromX(s, u);
                var l = e.r.invm(f),
                  b = f.sub(a).mul(l).umod(f),
                  p = d.mul(l).umod(f);
                return this.g.mulAdd(b, s, p);
              }),
              (i.prototype.getKeyRecoveryParam = function (t, e, i, r) {
                if (((e = new o(e, r)), null !== e.recoveryParam)) return e.recoveryParam;
                for (var n = 0; 4 > n; n++) {
                  var f;
                  try {
                    f = this.recoverPubKey(t, e, n);
                  } catch (t) {
                    continue;
                  }
                  if (f.eq(i)) return n;
                }
                throw Error("Unable to find valid recovery factor");
              });
          },
          { "../../elliptic": 1, "./key": 9, "./signature": 10, "bn.js": 16, "hmac-drbg": 25 },
        ],
        9: [
          function (t, e) {
            "use strict";
            function i(t, e) {
              (this.ec = t),
                (this.priv = null),
                (this.pub = null),
                e.priv && this._importPrivate(e.priv, e.privEnc),
                e.pub && this._importPublic(e.pub, e.pubEnc);
            }
            var r = t("bn.js"),
              n = t("../../elliptic"),
              f = n.utils,
              a = f.assert;
            (e.exports = i),
              (i.fromPublic = function (t, e, r) {
                return e instanceof i ? e : new i(t, { pub: e, pubEnc: r });
              }),
              (i.fromPrivate = function (t, e, r) {
                return e instanceof i ? e : new i(t, { priv: e, privEnc: r });
              }),
              (i.prototype.validate = function () {
                var t = this.getPublic();
                return t.isInfinity()
                  ? { result: !1, reason: "Invalid public key" }
                  : t.validate()
                  ? t.mul(this.ec.curve.n).isInfinity()
                    ? { result: !0, reason: null }
                    : { result: !1, reason: "Public key * N != O" }
                  : { result: !1, reason: "Public key is not a point" };
              }),
              (i.prototype.getPublic = function (t, e) {
                return (
                  "string" == typeof t && ((e = t), (t = null)),
                  this.pub || (this.pub = this.ec.g.mul(this.priv)),
                  e ? this.pub.encode(e, t) : this.pub
                );
              }),
              (i.prototype.getPrivate = function (t) {
                return "hex" === t ? this.priv.toString(16, 2) : this.priv;
              }),
              (i.prototype._importPrivate = function (t, e) {
                (this.priv = new r(t, e || 16)), (this.priv = this.priv.umod(this.ec.curve.n));
              }),
              (i.prototype._importPublic = function (t, e) {
                return t.x || t.y
                  ? ("mont" === this.ec.curve.type
                      ? a(t.x, "Need x coordinate")
                      : ("short" === this.ec.curve.type || "edwards" === this.ec.curve.type) && a(t.x && t.y, "Need both x and y coordinate"),
                    (this.pub = this.ec.curve.point(t.x, t.y)),
                    void 0)
                  : ((this.pub = this.ec.curve.decodePoint(t, e)), void 0);
              }),
              (i.prototype.derive = function (t) {
                return t.mul(this.priv).getX();
              }),
              (i.prototype.sign = function (t, e, i) {
                return this.ec.sign(t, this, e, i);
              }),
              (i.prototype.verify = function (t, e) {
                return this.ec.verify(t, e, this);
              }),
              (i.prototype.inspect = function () {
                return "<Key priv: " + (this.priv && this.priv.toString(16, 2)) + " pub: " + (this.pub && this.pub.inspect()) + " >";
              });
          },
          { "../../elliptic": 1, "bn.js": 16 },
        ],
        10: [
          function (t, e) {
            "use strict";
            function i(t, e) {
              return t instanceof i
                ? t
                : (this._importDER(t, e) ||
                    (d(t.r && t.s, "Signature without r or s"),
                    (this.r = new h(t.r, 16)),
                    (this.s = new h(t.s, 16)),
                    (this.recoveryParam = void 0 === t.recoveryParam ? null : t.recoveryParam)),
                  void 0);
            }
            function r() {
              this.place = 0;
            }
            function n(t, e) {
              var i = t[e.place++];
              if (!(128 & i)) return i;
              for (var r = 15 & i, n = 0, f = 0, a = e.place; r > f; f++, a++) (n <<= 8), (n |= t[a]);
              return (e.place = a), n;
            }
            function f(t) {
              for (var e = 0, i = t.length - 1; !t[e] && !(128 & t[e + 1]) && i > e; ) e++;
              return 0 === e ? t : t.slice(e);
            }
            function a(t, e) {
              if (128 > e) return t.push(e), void 0;
              var i = 1 + ((Math.log(e) / Math.LN2) >>> 3);
              for (t.push(128 | i); --i; ) t.push(255 & (e >>> (i << 3)));
              t.push(e);
            }
            var h = t("bn.js"),
              s = t("../../elliptic"),
              o = s.utils,
              d = o.assert;
            (e.exports = i),
              (i.prototype._importDER = function (t, e) {
                t = o.toArray(t, e);
                var i = new r();
                if (48 !== t[i.place++]) return !1;
                var f = n(t, i);
                if (f + i.place !== t.length) return !1;
                if (2 !== t[i.place++]) return !1;
                var a = n(t, i),
                  s = t.slice(i.place, a + i.place);
                if (((i.place += a), 2 !== t[i.place++])) return !1;
                var d = n(t, i);
                if (t.length !== d + i.place) return !1;
                var u = t.slice(i.place, d + i.place);
                return (
                  0 === s[0] && 128 & s[1] && (s = s.slice(1)),
                  0 === u[0] && 128 & u[1] && (u = u.slice(1)),
                  (this.r = new h(s)),
                  (this.s = new h(u)),
                  (this.recoveryParam = null),
                  !0
                );
              }),
              (i.prototype.toDER = function (t) {
                var e = this.r.toArray(),
                  i = this.s.toArray();
                for (128 & e[0] && (e = [0].concat(e)), 128 & i[0] && (i = [0].concat(i)), e = f(e), i = f(i); !(i[0] || 128 & i[1]); )
                  i = i.slice(1);
                var r = [2];
                a(r, e.length), (r = r.concat(e)), r.push(2), a(r, i.length);
                var n = r.concat(i),
                  h = [48];
                return a(h, n.length), (h = h.concat(n)), o.encode(h, t);
              });
          },
          { "../../elliptic": 1, "bn.js": 16 },
        ],
        11: [
          function (t, e) {
            "use strict";
            function i(t) {
              if ((a("ed25519" === t, "only tested with ed25519 so far"), !(this instanceof i))) return new i(t);
              var t = n.curves[t].curve;
              (this.curve = t),
                (this.g = t.g),
                this.g.precompute(t.n.bitLength() + 1),
                (this.pointClass = t.point().constructor),
                (this.encodingLength = Math.ceil(t.n.bitLength() / 8)),
                (this.hash = r.sha512);
            }
            var r = t("hash.js"),
              n = t("../../elliptic"),
              f = n.utils,
              a = f.assert,
              h = f.parseBytes,
              s = t("./key"),
              o = t("./signature");
            (e.exports = i),
              (i.prototype.sign = function (t, e) {
                t = h(t);
                var i = this.keyFromSecret(e),
                  r = this.hashInt(i.messagePrefix(), t),
                  n = this.g.mul(r),
                  f = this.encodePoint(n),
                  a = this.hashInt(f, i.pubBytes(), t).mul(i.priv()),
                  s = r.add(a).umod(this.curve.n);
                return this.makeSignature({ R: n, S: s, Rencoded: f });
              }),
              (i.prototype.verify = function (t, e, i) {
                (t = h(t)), (e = this.makeSignature(e));
                var r = this.keyFromPublic(i),
                  n = this.hashInt(e.Rencoded(), r.pubBytes(), t),
                  f = this.g.mul(e.S()),
                  a = e.R().add(r.pub().mul(n));
                return a.eq(f);
              }),
              (i.prototype.hashInt = function () {
                for (var t = this.hash(), e = 0; arguments.length > e; e++) t.update(arguments[e]);
                return f.intFromLE(t.digest()).umod(this.curve.n);
              }),
              (i.prototype.keyFromPublic = function (t) {
                return s.fromPublic(this, t);
              }),
              (i.prototype.keyFromSecret = function (t) {
                return s.fromSecret(this, t);
              }),
              (i.prototype.makeSignature = function (t) {
                return t instanceof o ? t : new o(this, t);
              }),
              (i.prototype.encodePoint = function (t) {
                var e = t.getY().toArray("le", this.encodingLength);
                return (e[this.encodingLength - 1] |= t.getX().isOdd() ? 128 : 0), e;
              }),
              (i.prototype.decodePoint = function (t) {
                t = f.parseBytes(t);
                var e = t.length - 1,
                  i = t.slice(0, e).concat(-129 & t[e]),
                  r = 0 !== (128 & t[e]),
                  n = f.intFromLE(i);
                return this.curve.pointFromY(n, r);
              }),
              (i.prototype.encodeInt = function (t) {
                return t.toArray("le", this.encodingLength);
              }),
              (i.prototype.decodeInt = function (t) {
                return f.intFromLE(t);
              }),
              (i.prototype.isPoint = function (t) {
                return t instanceof this.pointClass;
              });
          },
          { "../../elliptic": 1, "./key": 12, "./signature": 13, "hash.js": 19 },
        ],
        12: [
          function (t, e) {
            "use strict";
            function i(t, e) {
              (this.eddsa = t), (this._secret = a(e.secret)), t.isPoint(e.pub) ? (this._pub = e.pub) : (this._pubBytes = a(e.pub));
            }
            var r = t("../../elliptic"),
              n = r.utils,
              f = n.assert,
              a = n.parseBytes,
              h = n.cachedProperty;
            (i.fromPublic = function (t, e) {
              return e instanceof i ? e : new i(t, { pub: e });
            }),
              (i.fromSecret = function (t, e) {
                return e instanceof i ? e : new i(t, { secret: e });
              }),
              (i.prototype.secret = function () {
                return this._secret;
              }),
              h(i, "pubBytes", function () {
                return this.eddsa.encodePoint(this.pub());
              }),
              h(i, "pub", function () {
                return this._pubBytes ? this.eddsa.decodePoint(this._pubBytes) : this.eddsa.g.mul(this.priv());
              }),
              h(i, "privBytes", function () {
                var t = this.eddsa,
                  e = this.hash(),
                  i = t.encodingLength - 1,
                  r = e.slice(0, t.encodingLength);
                return (r[0] &= 248), (r[i] &= 127), (r[i] |= 64), r;
              }),
              h(i, "priv", function () {
                return this.eddsa.decodeInt(this.privBytes());
              }),
              h(i, "hash", function () {
                return this.eddsa.hash().update(this.secret()).digest();
              }),
              h(i, "messagePrefix", function () {
                return this.hash().slice(this.eddsa.encodingLength);
              }),
              (i.prototype.sign = function (t) {
                return f(this._secret, "KeyPair can only verify"), this.eddsa.sign(t, this);
              }),
              (i.prototype.verify = function (t, e) {
                return this.eddsa.verify(t, e, this);
              }),
              (i.prototype.getSecret = function (t) {
                return f(this._secret, "KeyPair is public only"), n.encode(this.secret(), t);
              }),
              (i.prototype.getPublic = function (t) {
                return n.encode(this.pubBytes(), t);
              }),
              (e.exports = i);
          },
          { "../../elliptic": 1 },
        ],
        13: [
          function (t, e) {
            "use strict";
            function i(t, e) {
              (this.eddsa = t),
                "object" != typeof e && (e = s(e)),
                Array.isArray(e) && (e = { R: e.slice(0, t.encodingLength), S: e.slice(t.encodingLength) }),
                a(e.R && e.S, "Signature without R or S"),
                t.isPoint(e.R) && (this._R = e.R),
                e.S instanceof r && (this._S = e.S),
                (this._Rencoded = Array.isArray(e.R) ? e.R : e.Rencoded),
                (this._Sencoded = Array.isArray(e.S) ? e.S : e.Sencoded);
            }
            var r = t("bn.js"),
              n = t("../../elliptic"),
              f = n.utils,
              a = f.assert,
              h = f.cachedProperty,
              s = f.parseBytes;
            h(i, "S", function () {
              return this.eddsa.decodeInt(this.Sencoded());
            }),
              h(i, "R", function () {
                return this.eddsa.decodePoint(this.Rencoded());
              }),
              h(i, "Rencoded", function () {
                return this.eddsa.encodePoint(this.R());
              }),
              h(i, "Sencoded", function () {
                return this.eddsa.encodeInt(this.S());
              }),
              (i.prototype.toBytes = function () {
                return this.Rencoded().concat(this.Sencoded());
              }),
              (i.prototype.toHex = function () {
                return f.encode(this.toBytes(), "hex").toUpperCase();
              }),
              (e.exports = i);
          },
          { "../../elliptic": 1, "bn.js": 16 },
        ],
        14: [
          function (t, e) {
            e.exports = {
              doubles: {
                step: 4,
                points: [
                  [
                    "e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a",
                    "f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821",
                  ],
                  [
                    "8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508",
                    "11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf",
                  ],
                  [
                    "175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739",
                    "d3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695",
                  ],
                  [
                    "363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640",
                    "4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9",
                  ],
                  [
                    "8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c",
                    "4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36",
                  ],
                  [
                    "723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda",
                    "96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f",
                  ],
                  [
                    "eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa",
                    "5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999",
                  ],
                  [
                    "100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0",
                    "cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09",
                  ],
                  [
                    "e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d",
                    "9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d",
                  ],
                  [
                    "feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d",
                    "e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088",
                  ],
                  [
                    "da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1",
                    "9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d",
                  ],
                  [
                    "53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0",
                    "5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8",
                  ],
                  [
                    "8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047",
                    "10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a",
                  ],
                  [
                    "385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862",
                    "283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453",
                  ],
                  [
                    "6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7",
                    "7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160",
                  ],
                  [
                    "3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd",
                    "56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0",
                  ],
                  [
                    "85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83",
                    "7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6",
                  ],
                  [
                    "948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a",
                    "53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589",
                  ],
                  [
                    "6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8",
                    "bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17",
                  ],
                  [
                    "e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d",
                    "4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda",
                  ],
                  [
                    "e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725",
                    "7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd",
                  ],
                  [
                    "213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754",
                    "4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2",
                  ],
                  [
                    "4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c",
                    "17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6",
                  ],
                  [
                    "fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6",
                    "6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f",
                  ],
                  [
                    "76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39",
                    "c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01",
                  ],
                  [
                    "c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891",
                    "893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3",
                  ],
                  [
                    "d895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b",
                    "febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f",
                  ],
                  [
                    "b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03",
                    "2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7",
                  ],
                  [
                    "e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d",
                    "eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78",
                  ],
                  [
                    "a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070",
                    "7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1",
                  ],
                  [
                    "90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4",
                    "e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150",
                  ],
                  [
                    "8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da",
                    "662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82",
                  ],
                  [
                    "e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11",
                    "1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc",
                  ],
                  [
                    "8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e",
                    "efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b",
                  ],
                  [
                    "e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41",
                    "2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51",
                  ],
                  [
                    "b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef",
                    "67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45",
                  ],
                  [
                    "d68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8",
                    "db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120",
                  ],
                  [
                    "324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d",
                    "648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84",
                  ],
                  [
                    "4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96",
                    "35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d",
                  ],
                  [
                    "9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd",
                    "ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d",
                  ],
                  [
                    "6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5",
                    "9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8",
                  ],
                  [
                    "a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266",
                    "40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8",
                  ],
                  [
                    "7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71",
                    "34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac",
                  ],
                  [
                    "928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac",
                    "c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f",
                  ],
                  [
                    "85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751",
                    "1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962",
                  ],
                  [
                    "ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e",
                    "493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907",
                  ],
                  [
                    "827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241",
                    "c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec",
                  ],
                  [
                    "eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3",
                    "be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d",
                  ],
                  [
                    "e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f",
                    "4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414",
                  ],
                  [
                    "1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19",
                    "aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd",
                  ],
                  [
                    "146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be",
                    "b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0",
                  ],
                  [
                    "fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9",
                    "6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811",
                  ],
                  [
                    "da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2",
                    "8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1",
                  ],
                  [
                    "a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13",
                    "7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c",
                  ],
                  [
                    "174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c",
                    "ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73",
                  ],
                  [
                    "959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba",
                    "2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd",
                  ],
                  [
                    "d2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151",
                    "e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405",
                  ],
                  [
                    "64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073",
                    "d99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589",
                  ],
                  [
                    "8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458",
                    "38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e",
                  ],
                  [
                    "13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b",
                    "69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27",
                  ],
                  [
                    "bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366",
                    "d3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1",
                  ],
                  [
                    "8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa",
                    "40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482",
                  ],
                  [
                    "8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0",
                    "620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945",
                  ],
                  [
                    "dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787",
                    "7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573",
                  ],
                  [
                    "f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e",
                    "ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82",
                  ],
                ],
              },
              naf: {
                wnd: 7,
                points: [
                  [
                    "f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9",
                    "388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672",
                  ],
                  [
                    "2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4",
                    "d8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6",
                  ],
                  [
                    "5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc",
                    "6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da",
                  ],
                  [
                    "acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe",
                    "cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37",
                  ],
                  [
                    "774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb",
                    "d984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b",
                  ],
                  [
                    "f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8",
                    "ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81",
                  ],
                  [
                    "d7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e",
                    "581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58",
                  ],
                  [
                    "defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34",
                    "4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77",
                  ],
                  [
                    "2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c",
                    "85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a",
                  ],
                  [
                    "352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5",
                    "321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c",
                  ],
                  [
                    "2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f",
                    "2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67",
                  ],
                  [
                    "9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714",
                    "73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402",
                  ],
                  [
                    "daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729",
                    "a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55",
                  ],
                  [
                    "c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db",
                    "2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482",
                  ],
                  [
                    "6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4",
                    "e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82",
                  ],
                  [
                    "1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5",
                    "b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396",
                  ],
                  [
                    "605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479",
                    "2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49",
                  ],
                  [
                    "62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d",
                    "80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf",
                  ],
                  [
                    "80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f",
                    "1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a",
                  ],
                  [
                    "7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb",
                    "d0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7",
                  ],
                  [
                    "d528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9",
                    "eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933",
                  ],
                  [
                    "49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963",
                    "758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a",
                  ],
                  [
                    "77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74",
                    "958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6",
                  ],
                  [
                    "f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530",
                    "e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37",
                  ],
                  [
                    "463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b",
                    "5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e",
                  ],
                  [
                    "f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247",
                    "cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6",
                  ],
                  [
                    "caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1",
                    "cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476",
                  ],
                  [
                    "2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120",
                    "4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40",
                  ],
                  [
                    "7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435",
                    "91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61",
                  ],
                  [
                    "754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18",
                    "673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683",
                  ],
                  [
                    "e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8",
                    "59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5",
                  ],
                  [
                    "186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb",
                    "3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b",
                  ],
                  [
                    "df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f",
                    "55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417",
                  ],
                  [
                    "5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143",
                    "efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868",
                  ],
                  [
                    "290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba",
                    "e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a",
                  ],
                  [
                    "af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45",
                    "f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6",
                  ],
                  [
                    "766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a",
                    "744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996",
                  ],
                  [
                    "59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e",
                    "c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e",
                  ],
                  [
                    "f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8",
                    "e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d",
                  ],
                  [
                    "7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c",
                    "30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2",
                  ],
                  [
                    "948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519",
                    "e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e",
                  ],
                  [
                    "7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab",
                    "100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437",
                  ],
                  [
                    "3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca",
                    "ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311",
                  ],
                  [
                    "d3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf",
                    "8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4",
                  ],
                  [
                    "1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610",
                    "68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575",
                  ],
                  [
                    "733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4",
                    "f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d",
                  ],
                  [
                    "15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c",
                    "d56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d",
                  ],
                  [
                    "a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940",
                    "edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629",
                  ],
                  [
                    "e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980",
                    "a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06",
                  ],
                  [
                    "311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3",
                    "66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374",
                  ],
                  [
                    "34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf",
                    "9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee",
                  ],
                  [
                    "f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63",
                    "4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1",
                  ],
                  [
                    "d7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448",
                    "fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b",
                  ],
                  [
                    "32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf",
                    "5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661",
                  ],
                  [
                    "7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5",
                    "8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6",
                  ],
                  [
                    "ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6",
                    "8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e",
                  ],
                  [
                    "16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5",
                    "5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d",
                  ],
                  [
                    "eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99",
                    "f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc",
                  ],
                  [
                    "78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51",
                    "f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4",
                  ],
                  [
                    "494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5",
                    "42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c",
                  ],
                  [
                    "a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5",
                    "204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b",
                  ],
                  [
                    "c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997",
                    "4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913",
                  ],
                  [
                    "841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881",
                    "73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154",
                  ],
                  [
                    "5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5",
                    "39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865",
                  ],
                  [
                    "36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66",
                    "d2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc",
                  ],
                  [
                    "336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726",
                    "ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224",
                  ],
                  [
                    "8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede",
                    "6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e",
                  ],
                  [
                    "1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94",
                    "60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6",
                  ],
                  [
                    "85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31",
                    "3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511",
                  ],
                  [
                    "29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51",
                    "b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b",
                  ],
                  [
                    "a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252",
                    "ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2",
                  ],
                  [
                    "4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5",
                    "cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c",
                  ],
                  [
                    "d24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b",
                    "6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3",
                  ],
                  [
                    "ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4",
                    "322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d",
                  ],
                  [
                    "af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f",
                    "6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700",
                  ],
                  [
                    "e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889",
                    "2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4",
                  ],
                  [
                    "591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246",
                    "b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196",
                  ],
                  [
                    "11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984",
                    "998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4",
                  ],
                  [
                    "3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a",
                    "b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257",
                  ],
                  [
                    "cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030",
                    "bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13",
                  ],
                  [
                    "c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197",
                    "6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096",
                  ],
                  [
                    "c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593",
                    "c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38",
                  ],
                  [
                    "a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef",
                    "21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f",
                  ],
                  [
                    "347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38",
                    "60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448",
                  ],
                  [
                    "da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a",
                    "49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a",
                  ],
                  [
                    "c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111",
                    "5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4",
                  ],
                  [
                    "4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502",
                    "7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437",
                  ],
                  [
                    "3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea",
                    "be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7",
                  ],
                  [
                    "cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26",
                    "8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d",
                  ],
                  [
                    "b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986",
                    "39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a",
                  ],
                  [
                    "d4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e",
                    "62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54",
                  ],
                  [
                    "48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4",
                    "25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77",
                  ],
                  [
                    "dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda",
                    "ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517",
                  ],
                  [
                    "6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859",
                    "cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10",
                  ],
                  [
                    "e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f",
                    "f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125",
                  ],
                  [
                    "eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c",
                    "6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e",
                  ],
                  [
                    "13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942",
                    "fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1",
                  ],
                  [
                    "ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a",
                    "1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2",
                  ],
                  [
                    "b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80",
                    "5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423",
                  ],
                  [
                    "ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d",
                    "438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8",
                  ],
                  [
                    "8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1",
                    "cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758",
                  ],
                  [
                    "52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63",
                    "c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375",
                  ],
                  [
                    "e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352",
                    "6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d",
                  ],
                  [
                    "7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193",
                    "ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec",
                  ],
                  [
                    "5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00",
                    "9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0",
                  ],
                  [
                    "32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58",
                    "ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c",
                  ],
                  [
                    "e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7",
                    "d3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4",
                  ],
                  [
                    "8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8",
                    "c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f",
                  ],
                  [
                    "4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e",
                    "67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649",
                  ],
                  [
                    "3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d",
                    "cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826",
                  ],
                  [
                    "674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b",
                    "299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5",
                  ],
                  [
                    "d32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f",
                    "f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87",
                  ],
                  [
                    "30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6",
                    "462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b",
                  ],
                  [
                    "be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297",
                    "62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc",
                  ],
                  [
                    "93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a",
                    "7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c",
                  ],
                  [
                    "b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c",
                    "ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f",
                  ],
                  [
                    "d5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52",
                    "4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a",
                  ],
                  [
                    "d3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb",
                    "bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46",
                  ],
                  [
                    "463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065",
                    "bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f",
                  ],
                  [
                    "7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917",
                    "603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03",
                  ],
                  [
                    "74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9",
                    "cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08",
                  ],
                  [
                    "30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3",
                    "553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8",
                  ],
                  [
                    "9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57",
                    "712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373",
                  ],
                  [
                    "176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66",
                    "ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3",
                  ],
                  [
                    "75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8",
                    "9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8",
                  ],
                  [
                    "809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721",
                    "9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1",
                  ],
                  [
                    "1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180",
                    "4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9",
                  ],
                ],
              },
            };
          },
          {},
        ],
        15: [
          function (t, e, i) {
            "use strict";
            function r(t, e) {
              for (var i = [], r = 1 << (e + 1), n = t.clone(); n.cmpn(1) >= 0; ) {
                var f;
                if (n.isOdd()) {
                  var a = n.andln(r - 1);
                  (f = a > (r >> 1) - 1 ? (r >> 1) - a : a), n.isubn(f);
                } else f = 0;
                i.push(f);
                for (var h = 0 !== n.cmpn(0) && 0 === n.andln(r - 1) ? e + 1 : 1, s = 1; h > s; s++) i.push(0);
                n.iushrn(h);
              }
              return i;
            }
            function n(t, e) {
              var i = [[], []];
              (t = t.clone()), (e = e.clone());
              for (var r = 0, n = 0; t.cmpn(-r) > 0 || e.cmpn(-n) > 0; ) {
                var f = 3 & (t.andln(3) + r),
                  a = 3 & (e.andln(3) + n);
                3 === f && (f = -1), 3 === a && (a = -1);
                var h;
                if (0 === (1 & f)) h = 0;
                else {
                  var s = 7 & (t.andln(7) + r);
                  h = (3 !== s && 5 !== s) || 2 !== a ? f : -f;
                }
                i[0].push(h);
                var o;
                if (0 === (1 & a)) o = 0;
                else {
                  var s = 7 & (e.andln(7) + n);
                  o = (3 !== s && 5 !== s) || 2 !== f ? a : -a;
                }
                i[1].push(o), 2 * r === h + 1 && (r = 1 - r), 2 * n === o + 1 && (n = 1 - n), t.iushrn(1), e.iushrn(1);
              }
              return i;
            }
            function f(t, e, i) {
              var r = "_" + e;
              t.prototype[e] = function () {
                return void 0 !== this[r] ? this[r] : (this[r] = i.call(this));
              };
            }
            function a(t) {
              return "string" == typeof t ? s.toArray(t, "hex") : t;
            }
            function h(t) {
              return new o(t, "hex", "le");
            }
            var s = i,
              o = t("bn.js"),
              d = t("minimalistic-assert"),
              u = t("minimalistic-crypto-utils");
            (s.assert = d),
              (s.toArray = u.toArray),
              (s.zero2 = u.zero2),
              (s.toHex = u.toHex),
              (s.encode = u.encode),
              (s.getNAF = r),
              (s.getJSF = n),
              (s.cachedProperty = f),
              (s.parseBytes = a),
              (s.intFromLE = h);
          },
          { "bn.js": 16, "minimalistic-assert": 28, "minimalistic-crypto-utils": 29 },
        ],
        16: [
          function (t, e) {
            (function (e, i) {
              "use strict";
              function r(t, e) {
                if (!t) throw Error(e || "Assertion failed");
              }
              function n(t, e) {
                t.super_ = e;
                var i = function () {};
                (i.prototype = e.prototype), (t.prototype = new i()), (t.prototype.constructor = t);
              }
              function f(t, e, i) {
                return f.isBN(t)
                  ? t
                  : ((this.negative = 0),
                    (this.words = null),
                    (this.length = 0),
                    (this.red = null),
                    null !== t && (("le" === e || "be" === e) && ((i = e), (e = 10)), this._init(t || 0, e || 10, i || "be")),
                    void 0);
              }
              function a(t, e, i) {
                for (var r = 0, n = Math.min(t.length, i), f = e; n > f; f++) {
                  var a = t.charCodeAt(f) - 48;
                  (r <<= 4), (r |= a >= 49 && 54 >= a ? a - 49 + 10 : a >= 17 && 22 >= a ? a - 17 + 10 : 15 & a);
                }
                return r;
              }
              function h(t, e, i, r) {
                for (var n = 0, f = Math.min(t.length, i), a = e; f > a; a++) {
                  var h = t.charCodeAt(a) - 48;
                  (n *= r), (n += h >= 49 ? h - 49 + 10 : h >= 17 ? h - 17 + 10 : h);
                }
                return n;
              }
              function s(t) {
                for (var e = Array(t.bitLength()), i = 0; e.length > i; i++) {
                  var r = 0 | (i / 26),
                    n = i % 26;
                  e[i] = (t.words[r] & (1 << n)) >>> n;
                }
                return e;
              }
              function o(t, e, i) {
                i.negative = e.negative ^ t.negative;
                var r = 0 | (t.length + e.length);
                (i.length = r), (r = 0 | (r - 1));
                var n = 0 | t.words[0],
                  f = 0 | e.words[0],
                  a = n * f,
                  h = 67108863 & a,
                  s = 0 | (a / 67108864);
                i.words[0] = h;
                for (var o = 1; r > o; o++) {
                  for (var d = s >>> 26, u = 67108863 & s, c = Math.min(o, e.length - 1), l = Math.max(0, o - t.length + 1); c >= l; l++) {
                    var b = 0 | (o - l);
                    (n = 0 | t.words[b]), (f = 0 | e.words[l]), (a = n * f + u), (d += 0 | (a / 67108864)), (u = 67108863 & a);
                  }
                  (i.words[o] = 0 | u), (s = 0 | d);
                }
                return 0 !== s ? (i.words[o] = 0 | s) : i.length--, i.strip();
              }
              function d(t, e, i) {
                (i.negative = e.negative ^ t.negative), (i.length = t.length + e.length);
                for (var r = 0, n = 0, f = 0; i.length - 1 > f; f++) {
                  var a = n;
                  n = 0;
                  for (var h = 67108863 & r, s = Math.min(f, e.length - 1), o = Math.max(0, f - t.length + 1); s >= o; o++) {
                    var d = f - o,
                      u = 0 | t.words[d],
                      c = 0 | e.words[o],
                      l = u * c,
                      b = 67108863 & l;
                    (a = 0 | (a + (0 | (l / 67108864)))),
                      (b = 0 | (b + h)),
                      (h = 67108863 & b),
                      (a = 0 | (a + (b >>> 26))),
                      (n += a >>> 26),
                      (a &= 67108863);
                  }
                  (i.words[f] = h), (r = a), (a = n);
                }
                return 0 !== r ? (i.words[f] = r) : i.length--, i.strip();
              }
              function u(t, e, i) {
                var r = new c();
                return r.mulp(t, e, i);
              }
              function c(t, e) {
                (this.x = t), (this.y = e);
              }
              function l(t, e) {
                (this.name = t),
                  (this.p = new f(e, 16)),
                  (this.n = this.p.bitLength()),
                  (this.k = new f(1).iushln(this.n).isub(this.p)),
                  (this.tmp = this._tmp());
              }
              function b() {
                l.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
              }
              function p() {
                l.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
              }
              function m() {
                l.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
              }
              function v() {
                l.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
              }
              function y(t) {
                if ("string" == typeof t) {
                  var e = f._prime(t);
                  (this.m = e.p), (this.prime = e);
                } else r(t.gtn(1), "modulus must be greater than 1"), (this.m = t), (this.prime = null);
              }
              function g(t) {
                y.call(this, t),
                  (this.shift = this.m.bitLength()),
                  0 !== this.shift % 26 && (this.shift += 26 - (this.shift % 26)),
                  (this.r = new f(1).iushln(this.shift)),
                  (this.r2 = this.imod(this.r.sqr())),
                  (this.rinv = this.r._invmp(this.m)),
                  (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
                  (this.minv = this.minv.umod(this.r)),
                  (this.minv = this.r.sub(this.minv));
              }
              "object" == typeof e ? (e.exports = f) : (i.BN = f), (f.BN = f), (f.wordSize = 26);
              var M;
              try {
                M = t("buffer").Buffer;
              } catch (w) {}
              (f.isBN = function (t) {
                return t instanceof f ? !0 : null !== t && "object" == typeof t && t.constructor.wordSize === f.wordSize && Array.isArray(t.words);
              }),
                (f.max = function (t, e) {
                  return t.cmp(e) > 0 ? t : e;
                }),
                (f.min = function (t, e) {
                  return 0 > t.cmp(e) ? t : e;
                }),
                (f.prototype._init = function (t, e, i) {
                  if ("number" == typeof t) return this._initNumber(t, e, i);
                  if ("object" == typeof t) return this._initArray(t, e, i);
                  "hex" === e && (e = 16), r(e === (0 | e) && e >= 2 && 36 >= e), (t = ("" + t).replace(/\s+/g, ""));
                  var n = 0;
                  "-" === t[0] && n++,
                    16 === e ? this._parseHex(t, n) : this._parseBase(t, e, n),
                    "-" === t[0] && (this.negative = 1),
                    this.strip(),
                    "le" === i && this._initArray(this.toArray(), e, i);
                }),
                (f.prototype._initNumber = function (t, e, i) {
                  0 > t && ((this.negative = 1), (t = -t)),
                    67108864 > t
                      ? ((this.words = [67108863 & t]), (this.length = 1))
                      : 4503599627370496 > t
                      ? ((this.words = [67108863 & t, 67108863 & (t / 67108864)]), (this.length = 2))
                      : (r(9007199254740992 > t), (this.words = [67108863 & t, 67108863 & (t / 67108864), 1]), (this.length = 3)),
                    "le" === i && this._initArray(this.toArray(), e, i);
                }),
                (f.prototype._initArray = function (t, e, i) {
                  if ((r("number" == typeof t.length), 0 >= t.length)) return (this.words = [0]), (this.length = 1), this;
                  (this.length = Math.ceil(t.length / 3)), (this.words = Array(this.length));
                  for (var n = 0; this.length > n; n++) this.words[n] = 0;
                  var f,
                    a,
                    h = 0;
                  if ("be" === i)
                    for (n = t.length - 1, f = 0; n >= 0; n -= 3)
                      (a = t[n] | (t[n - 1] << 8) | (t[n - 2] << 16)),
                        (this.words[f] |= 67108863 & (a << h)),
                        (this.words[f + 1] = 67108863 & (a >>> (26 - h))),
                        (h += 24),
                        h >= 26 && ((h -= 26), f++);
                  else if ("le" === i)
                    for (n = 0, f = 0; t.length > n; n += 3)
                      (a = t[n] | (t[n + 1] << 8) | (t[n + 2] << 16)),
                        (this.words[f] |= 67108863 & (a << h)),
                        (this.words[f + 1] = 67108863 & (a >>> (26 - h))),
                        (h += 24),
                        h >= 26 && ((h -= 26), f++);
                  return this.strip();
                }),
                (f.prototype._parseHex = function (t, e) {
                  (this.length = Math.ceil((t.length - e) / 6)), (this.words = Array(this.length));
                  for (var i = 0; this.length > i; i++) this.words[i] = 0;
                  var r,
                    n,
                    f = 0;
                  for (i = t.length - 6, r = 0; i >= e; i -= 6)
                    (n = a(t, i, i + 6)),
                      (this.words[r] |= 67108863 & (n << f)),
                      (this.words[r + 1] |= 4194303 & (n >>> (26 - f))),
                      (f += 24),
                      f >= 26 && ((f -= 26), r++);
                  i + 6 !== e && ((n = a(t, e, i + 6)), (this.words[r] |= 67108863 & (n << f)), (this.words[r + 1] |= 4194303 & (n >>> (26 - f)))),
                    this.strip();
                }),
                (f.prototype._parseBase = function (t, e, i) {
                  (this.words = [0]), (this.length = 1);
                  for (var r = 0, n = 1; 67108863 >= n; n *= e) r++;
                  r--, (n = 0 | (n / e));
                  for (var f = t.length - i, a = f % r, s = Math.min(f, f - a) + i, o = 0, d = i; s > d; d += r)
                    (o = h(t, d, d + r, e)), this.imuln(n), 67108864 > this.words[0] + o ? (this.words[0] += o) : this._iaddn(o);
                  if (0 !== a) {
                    var u = 1;
                    for (o = h(t, d, t.length, e), d = 0; a > d; d++) u *= e;
                    this.imuln(u), 67108864 > this.words[0] + o ? (this.words[0] += o) : this._iaddn(o);
                  }
                }),
                (f.prototype.copy = function (t) {
                  t.words = Array(this.length);
                  for (var e = 0; this.length > e; e++) t.words[e] = this.words[e];
                  (t.length = this.length), (t.negative = this.negative), (t.red = this.red);
                }),
                (f.prototype.clone = function () {
                  var t = new f(null);
                  return this.copy(t), t;
                }),
                (f.prototype._expand = function (t) {
                  for (; t > this.length; ) this.words[this.length++] = 0;
                  return this;
                }),
                (f.prototype.strip = function () {
                  for (; this.length > 1 && 0 === this.words[this.length - 1]; ) this.length--;
                  return this._normSign();
                }),
                (f.prototype._normSign = function () {
                  return 1 === this.length && 0 === this.words[0] && (this.negative = 0), this;
                }),
                (f.prototype.inspect = function () {
                  return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
                });
              var _ = [
                  "",
                  "0",
                  "00",
                  "000",
                  "0000",
                  "00000",
                  "000000",
                  "0000000",
                  "00000000",
                  "000000000",
                  "0000000000",
                  "00000000000",
                  "000000000000",
                  "0000000000000",
                  "00000000000000",
                  "000000000000000",
                  "0000000000000000",
                  "00000000000000000",
                  "000000000000000000",
                  "0000000000000000000",
                  "00000000000000000000",
                  "000000000000000000000",
                  "0000000000000000000000",
                  "00000000000000000000000",
                  "000000000000000000000000",
                  "0000000000000000000000000",
                ],
                S = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                A = [
                  0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536,
                  11390625, 16777216, 24137569, 34012224, 47045881, 64e6, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368,
                  20511149, 243e5, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176,
                ];
              (f.prototype.toString = function (t, e) {
                (t = t || 10), (e = 0 | e || 1);
                var i;
                if (16 === t || "hex" === t) {
                  i = "";
                  for (var n = 0, f = 0, a = 0; this.length > a; a++) {
                    var h = this.words[a],
                      s = (16777215 & ((h << n) | f)).toString(16);
                    (f = 16777215 & (h >>> (24 - n))),
                      (i = 0 !== f || a !== this.length - 1 ? _[6 - s.length] + s + i : s + i),
                      (n += 2),
                      n >= 26 && ((n -= 26), a--);
                  }
                  for (0 !== f && (i = f.toString(16) + i); 0 !== i.length % e; ) i = "0" + i;
                  return 0 !== this.negative && (i = "-" + i), i;
                }
                if (t === (0 | t) && t >= 2 && 36 >= t) {
                  var o = S[t],
                    d = A[t];
                  i = "";
                  var u = this.clone();
                  for (u.negative = 0; !u.isZero(); ) {
                    var c = u.modn(d).toString(t);
                    (u = u.idivn(d)), (i = u.isZero() ? c + i : _[o - c.length] + c + i);
                  }
                  for (this.isZero() && (i = "0" + i); 0 !== i.length % e; ) i = "0" + i;
                  return 0 !== this.negative && (i = "-" + i), i;
                }
                r(!1, "Base should be between 2 and 36");
              }),
                (f.prototype.toNumber = function () {
                  var t = this.words[0];
                  return (
                    2 === this.length
                      ? (t += 67108864 * this.words[1])
                      : 3 === this.length && 1 === this.words[2]
                      ? (t += 4503599627370496 + 67108864 * this.words[1])
                      : this.length > 2 && r(!1, "Number can only safely store up to 53 bits"),
                    0 !== this.negative ? -t : t
                  );
                }),
                (f.prototype.toJSON = function () {
                  return this.toString(16);
                }),
                (f.prototype.toBuffer = function (t, e) {
                  return r(M !== void 0), this.toArrayLike(M, t, e);
                }),
                (f.prototype.toArray = function (t, e) {
                  return this.toArrayLike(Array, t, e);
                }),
                (f.prototype.toArrayLike = function (t, e, i) {
                  var n = this.byteLength(),
                    f = i || Math.max(1, n);
                  r(f >= n, "byte array longer than desired length"), r(f > 0, "Requested array length <= 0"), this.strip();
                  var a,
                    h,
                    s = "le" === e,
                    o = new t(f),
                    d = this.clone();
                  if (s) {
                    for (h = 0; !d.isZero(); h++) (a = d.andln(255)), d.iushrn(8), (o[h] = a);
                    for (; f > h; h++) o[h] = 0;
                  } else {
                    for (h = 0; f - n > h; h++) o[h] = 0;
                    for (h = 0; !d.isZero(); h++) (a = d.andln(255)), d.iushrn(8), (o[f - h - 1] = a);
                  }
                  return o;
                }),
                (f.prototype._countBits = Math.clz32
                  ? function (t) {
                      return 32 - Math.clz32(t);
                    }
                  : function (t) {
                      var e = t,
                        i = 0;
                      return (
                        e >= 4096 && ((i += 13), (e >>>= 13)),
                        e >= 64 && ((i += 7), (e >>>= 7)),
                        e >= 8 && ((i += 4), (e >>>= 4)),
                        e >= 2 && ((i += 2), (e >>>= 2)),
                        i + e
                      );
                    }),
                (f.prototype._zeroBits = function (t) {
                  if (0 === t) return 26;
                  var e = t,
                    i = 0;
                  return (
                    0 === (8191 & e) && ((i += 13), (e >>>= 13)),
                    0 === (127 & e) && ((i += 7), (e >>>= 7)),
                    0 === (15 & e) && ((i += 4), (e >>>= 4)),
                    0 === (3 & e) && ((i += 2), (e >>>= 2)),
                    0 === (1 & e) && i++,
                    i
                  );
                }),
                (f.prototype.bitLength = function () {
                  var t = this.words[this.length - 1],
                    e = this._countBits(t);
                  return 26 * (this.length - 1) + e;
                }),
                (f.prototype.zeroBits = function () {
                  if (this.isZero()) return 0;
                  for (var t = 0, e = 0; this.length > e; e++) {
                    var i = this._zeroBits(this.words[e]);
                    if (((t += i), 26 !== i)) break;
                  }
                  return t;
                }),
                (f.prototype.byteLength = function () {
                  return Math.ceil(this.bitLength() / 8);
                }),
                (f.prototype.toTwos = function (t) {
                  return 0 !== this.negative ? this.abs().inotn(t).iaddn(1) : this.clone();
                }),
                (f.prototype.fromTwos = function (t) {
                  return this.testn(t - 1) ? this.notn(t).iaddn(1).ineg() : this.clone();
                }),
                (f.prototype.isNeg = function () {
                  return 0 !== this.negative;
                }),
                (f.prototype.neg = function () {
                  return this.clone().ineg();
                }),
                (f.prototype.ineg = function () {
                  return this.isZero() || (this.negative ^= 1), this;
                }),
                (f.prototype.iuor = function (t) {
                  for (; this.length < t.length; ) this.words[this.length++] = 0;
                  for (var e = 0; t.length > e; e++) this.words[e] = this.words[e] | t.words[e];
                  return this.strip();
                }),
                (f.prototype.ior = function (t) {
                  return r(0 === (this.negative | t.negative)), this.iuor(t);
                }),
                (f.prototype.or = function (t) {
                  return this.length > t.length ? this.clone().ior(t) : t.clone().ior(this);
                }),
                (f.prototype.uor = function (t) {
                  return this.length > t.length ? this.clone().iuor(t) : t.clone().iuor(this);
                }),
                (f.prototype.iuand = function (t) {
                  var e;
                  e = this.length > t.length ? t : this;
                  for (var i = 0; e.length > i; i++) this.words[i] = this.words[i] & t.words[i];
                  return (this.length = e.length), this.strip();
                }),
                (f.prototype.iand = function (t) {
                  return r(0 === (this.negative | t.negative)), this.iuand(t);
                }),
                (f.prototype.and = function (t) {
                  return this.length > t.length ? this.clone().iand(t) : t.clone().iand(this);
                }),
                (f.prototype.uand = function (t) {
                  return this.length > t.length ? this.clone().iuand(t) : t.clone().iuand(this);
                }),
                (f.prototype.iuxor = function (t) {
                  var e, i;
                  this.length > t.length ? ((e = this), (i = t)) : ((e = t), (i = this));
                  for (var r = 0; i.length > r; r++) this.words[r] = e.words[r] ^ i.words[r];
                  if (this !== e) for (; e.length > r; r++) this.words[r] = e.words[r];
                  return (this.length = e.length), this.strip();
                }),
                (f.prototype.ixor = function (t) {
                  return r(0 === (this.negative | t.negative)), this.iuxor(t);
                }),
                (f.prototype.xor = function (t) {
                  return this.length > t.length ? this.clone().ixor(t) : t.clone().ixor(this);
                }),
                (f.prototype.uxor = function (t) {
                  return this.length > t.length ? this.clone().iuxor(t) : t.clone().iuxor(this);
                }),
                (f.prototype.inotn = function (t) {
                  r("number" == typeof t && t >= 0);
                  var e = 0 | Math.ceil(t / 26),
                    i = t % 26;
                  this._expand(e), i > 0 && e--;
                  for (var n = 0; e > n; n++) this.words[n] = 67108863 & ~this.words[n];
                  return i > 0 && (this.words[n] = ~this.words[n] & (67108863 >> (26 - i))), this.strip();
                }),
                (f.prototype.notn = function (t) {
                  return this.clone().inotn(t);
                }),
                (f.prototype.setn = function (t, e) {
                  r("number" == typeof t && t >= 0);
                  var i = 0 | (t / 26),
                    n = t % 26;
                  return this._expand(i + 1), (this.words[i] = e ? this.words[i] | (1 << n) : this.words[i] & ~(1 << n)), this.strip();
                }),
                (f.prototype.iadd = function (t) {
                  var e;
                  if (0 !== this.negative && 0 === t.negative) return (this.negative = 0), (e = this.isub(t)), (this.negative ^= 1), this._normSign();
                  if (0 === this.negative && 0 !== t.negative) return (t.negative = 0), (e = this.isub(t)), (t.negative = 1), e._normSign();
                  var i, r;
                  this.length > t.length ? ((i = this), (r = t)) : ((i = t), (r = this));
                  for (var n = 0, f = 0; r.length > f; f++)
                    (e = (0 | i.words[f]) + (0 | r.words[f]) + n), (this.words[f] = 67108863 & e), (n = e >>> 26);
                  for (; 0 !== n && i.length > f; f++) (e = (0 | i.words[f]) + n), (this.words[f] = 67108863 & e), (n = e >>> 26);
                  if (((this.length = i.length), 0 !== n)) (this.words[this.length] = n), this.length++;
                  else if (i !== this) for (; i.length > f; f++) this.words[f] = i.words[f];
                  return this;
                }),
                (f.prototype.add = function (t) {
                  var e;
                  return 0 !== t.negative && 0 === this.negative
                    ? ((t.negative = 0), (e = this.sub(t)), (t.negative ^= 1), e)
                    : 0 === t.negative && 0 !== this.negative
                    ? ((this.negative = 0), (e = t.sub(this)), (this.negative = 1), e)
                    : this.length > t.length
                    ? this.clone().iadd(t)
                    : t.clone().iadd(this);
                }),
                (f.prototype.isub = function (t) {
                  if (0 !== t.negative) {
                    t.negative = 0;
                    var e = this.iadd(t);
                    return (t.negative = 1), e._normSign();
                  }
                  if (0 !== this.negative) return (this.negative = 0), this.iadd(t), (this.negative = 1), this._normSign();
                  var i = this.cmp(t);
                  if (0 === i) return (this.negative = 0), (this.length = 1), (this.words[0] = 0), this;
                  var r, n;
                  i > 0 ? ((r = this), (n = t)) : ((r = t), (n = this));
                  for (var f = 0, a = 0; n.length > a; a++)
                    (e = (0 | r.words[a]) - (0 | n.words[a]) + f), (f = e >> 26), (this.words[a] = 67108863 & e);
                  for (; 0 !== f && r.length > a; a++) (e = (0 | r.words[a]) + f), (f = e >> 26), (this.words[a] = 67108863 & e);
                  if (0 === f && r.length > a && r !== this) for (; r.length > a; a++) this.words[a] = r.words[a];
                  return (this.length = Math.max(this.length, a)), r !== this && (this.negative = 1), this.strip();
                }),
                (f.prototype.sub = function (t) {
                  return this.clone().isub(t);
                });
              var x = function x(t, e, i) {
                var r,
                  n,
                  f,
                  a = t.words,
                  h = e.words,
                  s = i.words,
                  o = 0,
                  d = 0 | a[0],
                  u = 8191 & d,
                  c = d >>> 13,
                  l = 0 | a[1],
                  b = 8191 & l,
                  p = l >>> 13,
                  m = 0 | a[2],
                  v = 8191 & m,
                  y = m >>> 13,
                  g = 0 | a[3],
                  M = 8191 & g,
                  w = g >>> 13,
                  _ = 0 | a[4],
                  S = 8191 & _,
                  A = _ >>> 13,
                  x = 0 | a[5],
                  R = 8191 & x,
                  I = x >>> 13,
                  E = 0 | a[6],
                  k = 8191 & E,
                  H = E >>> 13,
                  z = 0 | a[7],
                  q = 8191 & z,
                  P = z >>> 13,
                  O = 0 | a[8],
                  C = 8191 & O,
                  B = O >>> 13,
                  N = 0 | a[9],
                  j = 8191 & N,
                  X = N >>> 13,
                  T = 0 | h[0],
                  L = 8191 & T,
                  F = T >>> 13,
                  K = 0 | h[1],
                  Z = 8191 & K,
                  U = K >>> 13,
                  J = 0 | h[2],
                  D = 8191 & J,
                  W = J >>> 13,
                  V = 0 | h[3],
                  G = 8191 & V,
                  Y = V >>> 13,
                  Q = 0 | h[4],
                  $ = 8191 & Q,
                  te = Q >>> 13,
                  ee = 0 | h[5],
                  ie = 8191 & ee,
                  re = ee >>> 13,
                  ne = 0 | h[6],
                  fe = 8191 & ne,
                  ae = ne >>> 13,
                  he = 0 | h[7],
                  se = 8191 & he,
                  oe = he >>> 13,
                  de = 0 | h[8],
                  ue = 8191 & de,
                  ce = de >>> 13,
                  le = 0 | h[9],
                  be = 8191 & le,
                  pe = le >>> 13;
                (i.negative = t.negative ^ e.negative),
                  (i.length = 19),
                  (r = Math.imul(u, L)),
                  (n = Math.imul(u, F)),
                  (n = 0 | (n + Math.imul(c, L))),
                  (f = Math.imul(c, F));
                var me = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (me >>> 26))),
                  (me &= 67108863),
                  (r = Math.imul(b, L)),
                  (n = Math.imul(b, F)),
                  (n = 0 | (n + Math.imul(p, L))),
                  (f = Math.imul(p, F)),
                  (r = 0 | (r + Math.imul(u, Z))),
                  (n = 0 | (n + Math.imul(u, U))),
                  (n = 0 | (n + Math.imul(c, Z))),
                  (f = 0 | (f + Math.imul(c, U)));
                var ve = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (ve >>> 26))),
                  (ve &= 67108863),
                  (r = Math.imul(v, L)),
                  (n = Math.imul(v, F)),
                  (n = 0 | (n + Math.imul(y, L))),
                  (f = Math.imul(y, F)),
                  (r = 0 | (r + Math.imul(b, Z))),
                  (n = 0 | (n + Math.imul(b, U))),
                  (n = 0 | (n + Math.imul(p, Z))),
                  (f = 0 | (f + Math.imul(p, U))),
                  (r = 0 | (r + Math.imul(u, D))),
                  (n = 0 | (n + Math.imul(u, W))),
                  (n = 0 | (n + Math.imul(c, D))),
                  (f = 0 | (f + Math.imul(c, W)));
                var ye = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (ye >>> 26))),
                  (ye &= 67108863),
                  (r = Math.imul(M, L)),
                  (n = Math.imul(M, F)),
                  (n = 0 | (n + Math.imul(w, L))),
                  (f = Math.imul(w, F)),
                  (r = 0 | (r + Math.imul(v, Z))),
                  (n = 0 | (n + Math.imul(v, U))),
                  (n = 0 | (n + Math.imul(y, Z))),
                  (f = 0 | (f + Math.imul(y, U))),
                  (r = 0 | (r + Math.imul(b, D))),
                  (n = 0 | (n + Math.imul(b, W))),
                  (n = 0 | (n + Math.imul(p, D))),
                  (f = 0 | (f + Math.imul(p, W))),
                  (r = 0 | (r + Math.imul(u, G))),
                  (n = 0 | (n + Math.imul(u, Y))),
                  (n = 0 | (n + Math.imul(c, G))),
                  (f = 0 | (f + Math.imul(c, Y)));
                var ge = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (ge >>> 26))),
                  (ge &= 67108863),
                  (r = Math.imul(S, L)),
                  (n = Math.imul(S, F)),
                  (n = 0 | (n + Math.imul(A, L))),
                  (f = Math.imul(A, F)),
                  (r = 0 | (r + Math.imul(M, Z))),
                  (n = 0 | (n + Math.imul(M, U))),
                  (n = 0 | (n + Math.imul(w, Z))),
                  (f = 0 | (f + Math.imul(w, U))),
                  (r = 0 | (r + Math.imul(v, D))),
                  (n = 0 | (n + Math.imul(v, W))),
                  (n = 0 | (n + Math.imul(y, D))),
                  (f = 0 | (f + Math.imul(y, W))),
                  (r = 0 | (r + Math.imul(b, G))),
                  (n = 0 | (n + Math.imul(b, Y))),
                  (n = 0 | (n + Math.imul(p, G))),
                  (f = 0 | (f + Math.imul(p, Y))),
                  (r = 0 | (r + Math.imul(u, $))),
                  (n = 0 | (n + Math.imul(u, te))),
                  (n = 0 | (n + Math.imul(c, $))),
                  (f = 0 | (f + Math.imul(c, te)));
                var Me = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (Me >>> 26))),
                  (Me &= 67108863),
                  (r = Math.imul(R, L)),
                  (n = Math.imul(R, F)),
                  (n = 0 | (n + Math.imul(I, L))),
                  (f = Math.imul(I, F)),
                  (r = 0 | (r + Math.imul(S, Z))),
                  (n = 0 | (n + Math.imul(S, U))),
                  (n = 0 | (n + Math.imul(A, Z))),
                  (f = 0 | (f + Math.imul(A, U))),
                  (r = 0 | (r + Math.imul(M, D))),
                  (n = 0 | (n + Math.imul(M, W))),
                  (n = 0 | (n + Math.imul(w, D))),
                  (f = 0 | (f + Math.imul(w, W))),
                  (r = 0 | (r + Math.imul(v, G))),
                  (n = 0 | (n + Math.imul(v, Y))),
                  (n = 0 | (n + Math.imul(y, G))),
                  (f = 0 | (f + Math.imul(y, Y))),
                  (r = 0 | (r + Math.imul(b, $))),
                  (n = 0 | (n + Math.imul(b, te))),
                  (n = 0 | (n + Math.imul(p, $))),
                  (f = 0 | (f + Math.imul(p, te))),
                  (r = 0 | (r + Math.imul(u, ie))),
                  (n = 0 | (n + Math.imul(u, re))),
                  (n = 0 | (n + Math.imul(c, ie))),
                  (f = 0 | (f + Math.imul(c, re)));
                var we = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (we >>> 26))),
                  (we &= 67108863),
                  (r = Math.imul(k, L)),
                  (n = Math.imul(k, F)),
                  (n = 0 | (n + Math.imul(H, L))),
                  (f = Math.imul(H, F)),
                  (r = 0 | (r + Math.imul(R, Z))),
                  (n = 0 | (n + Math.imul(R, U))),
                  (n = 0 | (n + Math.imul(I, Z))),
                  (f = 0 | (f + Math.imul(I, U))),
                  (r = 0 | (r + Math.imul(S, D))),
                  (n = 0 | (n + Math.imul(S, W))),
                  (n = 0 | (n + Math.imul(A, D))),
                  (f = 0 | (f + Math.imul(A, W))),
                  (r = 0 | (r + Math.imul(M, G))),
                  (n = 0 | (n + Math.imul(M, Y))),
                  (n = 0 | (n + Math.imul(w, G))),
                  (f = 0 | (f + Math.imul(w, Y))),
                  (r = 0 | (r + Math.imul(v, $))),
                  (n = 0 | (n + Math.imul(v, te))),
                  (n = 0 | (n + Math.imul(y, $))),
                  (f = 0 | (f + Math.imul(y, te))),
                  (r = 0 | (r + Math.imul(b, ie))),
                  (n = 0 | (n + Math.imul(b, re))),
                  (n = 0 | (n + Math.imul(p, ie))),
                  (f = 0 | (f + Math.imul(p, re))),
                  (r = 0 | (r + Math.imul(u, fe))),
                  (n = 0 | (n + Math.imul(u, ae))),
                  (n = 0 | (n + Math.imul(c, fe))),
                  (f = 0 | (f + Math.imul(c, ae)));
                var _e = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (_e >>> 26))),
                  (_e &= 67108863),
                  (r = Math.imul(q, L)),
                  (n = Math.imul(q, F)),
                  (n = 0 | (n + Math.imul(P, L))),
                  (f = Math.imul(P, F)),
                  (r = 0 | (r + Math.imul(k, Z))),
                  (n = 0 | (n + Math.imul(k, U))),
                  (n = 0 | (n + Math.imul(H, Z))),
                  (f = 0 | (f + Math.imul(H, U))),
                  (r = 0 | (r + Math.imul(R, D))),
                  (n = 0 | (n + Math.imul(R, W))),
                  (n = 0 | (n + Math.imul(I, D))),
                  (f = 0 | (f + Math.imul(I, W))),
                  (r = 0 | (r + Math.imul(S, G))),
                  (n = 0 | (n + Math.imul(S, Y))),
                  (n = 0 | (n + Math.imul(A, G))),
                  (f = 0 | (f + Math.imul(A, Y))),
                  (r = 0 | (r + Math.imul(M, $))),
                  (n = 0 | (n + Math.imul(M, te))),
                  (n = 0 | (n + Math.imul(w, $))),
                  (f = 0 | (f + Math.imul(w, te))),
                  (r = 0 | (r + Math.imul(v, ie))),
                  (n = 0 | (n + Math.imul(v, re))),
                  (n = 0 | (n + Math.imul(y, ie))),
                  (f = 0 | (f + Math.imul(y, re))),
                  (r = 0 | (r + Math.imul(b, fe))),
                  (n = 0 | (n + Math.imul(b, ae))),
                  (n = 0 | (n + Math.imul(p, fe))),
                  (f = 0 | (f + Math.imul(p, ae))),
                  (r = 0 | (r + Math.imul(u, se))),
                  (n = 0 | (n + Math.imul(u, oe))),
                  (n = 0 | (n + Math.imul(c, se))),
                  (f = 0 | (f + Math.imul(c, oe)));
                var Se = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (Se >>> 26))),
                  (Se &= 67108863),
                  (r = Math.imul(C, L)),
                  (n = Math.imul(C, F)),
                  (n = 0 | (n + Math.imul(B, L))),
                  (f = Math.imul(B, F)),
                  (r = 0 | (r + Math.imul(q, Z))),
                  (n = 0 | (n + Math.imul(q, U))),
                  (n = 0 | (n + Math.imul(P, Z))),
                  (f = 0 | (f + Math.imul(P, U))),
                  (r = 0 | (r + Math.imul(k, D))),
                  (n = 0 | (n + Math.imul(k, W))),
                  (n = 0 | (n + Math.imul(H, D))),
                  (f = 0 | (f + Math.imul(H, W))),
                  (r = 0 | (r + Math.imul(R, G))),
                  (n = 0 | (n + Math.imul(R, Y))),
                  (n = 0 | (n + Math.imul(I, G))),
                  (f = 0 | (f + Math.imul(I, Y))),
                  (r = 0 | (r + Math.imul(S, $))),
                  (n = 0 | (n + Math.imul(S, te))),
                  (n = 0 | (n + Math.imul(A, $))),
                  (f = 0 | (f + Math.imul(A, te))),
                  (r = 0 | (r + Math.imul(M, ie))),
                  (n = 0 | (n + Math.imul(M, re))),
                  (n = 0 | (n + Math.imul(w, ie))),
                  (f = 0 | (f + Math.imul(w, re))),
                  (r = 0 | (r + Math.imul(v, fe))),
                  (n = 0 | (n + Math.imul(v, ae))),
                  (n = 0 | (n + Math.imul(y, fe))),
                  (f = 0 | (f + Math.imul(y, ae))),
                  (r = 0 | (r + Math.imul(b, se))),
                  (n = 0 | (n + Math.imul(b, oe))),
                  (n = 0 | (n + Math.imul(p, se))),
                  (f = 0 | (f + Math.imul(p, oe))),
                  (r = 0 | (r + Math.imul(u, ue))),
                  (n = 0 | (n + Math.imul(u, ce))),
                  (n = 0 | (n + Math.imul(c, ue))),
                  (f = 0 | (f + Math.imul(c, ce)));
                var Ae = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (Ae >>> 26))),
                  (Ae &= 67108863),
                  (r = Math.imul(j, L)),
                  (n = Math.imul(j, F)),
                  (n = 0 | (n + Math.imul(X, L))),
                  (f = Math.imul(X, F)),
                  (r = 0 | (r + Math.imul(C, Z))),
                  (n = 0 | (n + Math.imul(C, U))),
                  (n = 0 | (n + Math.imul(B, Z))),
                  (f = 0 | (f + Math.imul(B, U))),
                  (r = 0 | (r + Math.imul(q, D))),
                  (n = 0 | (n + Math.imul(q, W))),
                  (n = 0 | (n + Math.imul(P, D))),
                  (f = 0 | (f + Math.imul(P, W))),
                  (r = 0 | (r + Math.imul(k, G))),
                  (n = 0 | (n + Math.imul(k, Y))),
                  (n = 0 | (n + Math.imul(H, G))),
                  (f = 0 | (f + Math.imul(H, Y))),
                  (r = 0 | (r + Math.imul(R, $))),
                  (n = 0 | (n + Math.imul(R, te))),
                  (n = 0 | (n + Math.imul(I, $))),
                  (f = 0 | (f + Math.imul(I, te))),
                  (r = 0 | (r + Math.imul(S, ie))),
                  (n = 0 | (n + Math.imul(S, re))),
                  (n = 0 | (n + Math.imul(A, ie))),
                  (f = 0 | (f + Math.imul(A, re))),
                  (r = 0 | (r + Math.imul(M, fe))),
                  (n = 0 | (n + Math.imul(M, ae))),
                  (n = 0 | (n + Math.imul(w, fe))),
                  (f = 0 | (f + Math.imul(w, ae))),
                  (r = 0 | (r + Math.imul(v, se))),
                  (n = 0 | (n + Math.imul(v, oe))),
                  (n = 0 | (n + Math.imul(y, se))),
                  (f = 0 | (f + Math.imul(y, oe))),
                  (r = 0 | (r + Math.imul(b, ue))),
                  (n = 0 | (n + Math.imul(b, ce))),
                  (n = 0 | (n + Math.imul(p, ue))),
                  (f = 0 | (f + Math.imul(p, ce))),
                  (r = 0 | (r + Math.imul(u, be))),
                  (n = 0 | (n + Math.imul(u, pe))),
                  (n = 0 | (n + Math.imul(c, be))),
                  (f = 0 | (f + Math.imul(c, pe)));
                var xe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (xe >>> 26))),
                  (xe &= 67108863),
                  (r = Math.imul(j, Z)),
                  (n = Math.imul(j, U)),
                  (n = 0 | (n + Math.imul(X, Z))),
                  (f = Math.imul(X, U)),
                  (r = 0 | (r + Math.imul(C, D))),
                  (n = 0 | (n + Math.imul(C, W))),
                  (n = 0 | (n + Math.imul(B, D))),
                  (f = 0 | (f + Math.imul(B, W))),
                  (r = 0 | (r + Math.imul(q, G))),
                  (n = 0 | (n + Math.imul(q, Y))),
                  (n = 0 | (n + Math.imul(P, G))),
                  (f = 0 | (f + Math.imul(P, Y))),
                  (r = 0 | (r + Math.imul(k, $))),
                  (n = 0 | (n + Math.imul(k, te))),
                  (n = 0 | (n + Math.imul(H, $))),
                  (f = 0 | (f + Math.imul(H, te))),
                  (r = 0 | (r + Math.imul(R, ie))),
                  (n = 0 | (n + Math.imul(R, re))),
                  (n = 0 | (n + Math.imul(I, ie))),
                  (f = 0 | (f + Math.imul(I, re))),
                  (r = 0 | (r + Math.imul(S, fe))),
                  (n = 0 | (n + Math.imul(S, ae))),
                  (n = 0 | (n + Math.imul(A, fe))),
                  (f = 0 | (f + Math.imul(A, ae))),
                  (r = 0 | (r + Math.imul(M, se))),
                  (n = 0 | (n + Math.imul(M, oe))),
                  (n = 0 | (n + Math.imul(w, se))),
                  (f = 0 | (f + Math.imul(w, oe))),
                  (r = 0 | (r + Math.imul(v, ue))),
                  (n = 0 | (n + Math.imul(v, ce))),
                  (n = 0 | (n + Math.imul(y, ue))),
                  (f = 0 | (f + Math.imul(y, ce))),
                  (r = 0 | (r + Math.imul(b, be))),
                  (n = 0 | (n + Math.imul(b, pe))),
                  (n = 0 | (n + Math.imul(p, be))),
                  (f = 0 | (f + Math.imul(p, pe)));
                var Re = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (Re >>> 26))),
                  (Re &= 67108863),
                  (r = Math.imul(j, D)),
                  (n = Math.imul(j, W)),
                  (n = 0 | (n + Math.imul(X, D))),
                  (f = Math.imul(X, W)),
                  (r = 0 | (r + Math.imul(C, G))),
                  (n = 0 | (n + Math.imul(C, Y))),
                  (n = 0 | (n + Math.imul(B, G))),
                  (f = 0 | (f + Math.imul(B, Y))),
                  (r = 0 | (r + Math.imul(q, $))),
                  (n = 0 | (n + Math.imul(q, te))),
                  (n = 0 | (n + Math.imul(P, $))),
                  (f = 0 | (f + Math.imul(P, te))),
                  (r = 0 | (r + Math.imul(k, ie))),
                  (n = 0 | (n + Math.imul(k, re))),
                  (n = 0 | (n + Math.imul(H, ie))),
                  (f = 0 | (f + Math.imul(H, re))),
                  (r = 0 | (r + Math.imul(R, fe))),
                  (n = 0 | (n + Math.imul(R, ae))),
                  (n = 0 | (n + Math.imul(I, fe))),
                  (f = 0 | (f + Math.imul(I, ae))),
                  (r = 0 | (r + Math.imul(S, se))),
                  (n = 0 | (n + Math.imul(S, oe))),
                  (n = 0 | (n + Math.imul(A, se))),
                  (f = 0 | (f + Math.imul(A, oe))),
                  (r = 0 | (r + Math.imul(M, ue))),
                  (n = 0 | (n + Math.imul(M, ce))),
                  (n = 0 | (n + Math.imul(w, ue))),
                  (f = 0 | (f + Math.imul(w, ce))),
                  (r = 0 | (r + Math.imul(v, be))),
                  (n = 0 | (n + Math.imul(v, pe))),
                  (n = 0 | (n + Math.imul(y, be))),
                  (f = 0 | (f + Math.imul(y, pe)));
                var Ie = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (Ie >>> 26))),
                  (Ie &= 67108863),
                  (r = Math.imul(j, G)),
                  (n = Math.imul(j, Y)),
                  (n = 0 | (n + Math.imul(X, G))),
                  (f = Math.imul(X, Y)),
                  (r = 0 | (r + Math.imul(C, $))),
                  (n = 0 | (n + Math.imul(C, te))),
                  (n = 0 | (n + Math.imul(B, $))),
                  (f = 0 | (f + Math.imul(B, te))),
                  (r = 0 | (r + Math.imul(q, ie))),
                  (n = 0 | (n + Math.imul(q, re))),
                  (n = 0 | (n + Math.imul(P, ie))),
                  (f = 0 | (f + Math.imul(P, re))),
                  (r = 0 | (r + Math.imul(k, fe))),
                  (n = 0 | (n + Math.imul(k, ae))),
                  (n = 0 | (n + Math.imul(H, fe))),
                  (f = 0 | (f + Math.imul(H, ae))),
                  (r = 0 | (r + Math.imul(R, se))),
                  (n = 0 | (n + Math.imul(R, oe))),
                  (n = 0 | (n + Math.imul(I, se))),
                  (f = 0 | (f + Math.imul(I, oe))),
                  (r = 0 | (r + Math.imul(S, ue))),
                  (n = 0 | (n + Math.imul(S, ce))),
                  (n = 0 | (n + Math.imul(A, ue))),
                  (f = 0 | (f + Math.imul(A, ce))),
                  (r = 0 | (r + Math.imul(M, be))),
                  (n = 0 | (n + Math.imul(M, pe))),
                  (n = 0 | (n + Math.imul(w, be))),
                  (f = 0 | (f + Math.imul(w, pe)));
                var Ee = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (Ee >>> 26))),
                  (Ee &= 67108863),
                  (r = Math.imul(j, $)),
                  (n = Math.imul(j, te)),
                  (n = 0 | (n + Math.imul(X, $))),
                  (f = Math.imul(X, te)),
                  (r = 0 | (r + Math.imul(C, ie))),
                  (n = 0 | (n + Math.imul(C, re))),
                  (n = 0 | (n + Math.imul(B, ie))),
                  (f = 0 | (f + Math.imul(B, re))),
                  (r = 0 | (r + Math.imul(q, fe))),
                  (n = 0 | (n + Math.imul(q, ae))),
                  (n = 0 | (n + Math.imul(P, fe))),
                  (f = 0 | (f + Math.imul(P, ae))),
                  (r = 0 | (r + Math.imul(k, se))),
                  (n = 0 | (n + Math.imul(k, oe))),
                  (n = 0 | (n + Math.imul(H, se))),
                  (f = 0 | (f + Math.imul(H, oe))),
                  (r = 0 | (r + Math.imul(R, ue))),
                  (n = 0 | (n + Math.imul(R, ce))),
                  (n = 0 | (n + Math.imul(I, ue))),
                  (f = 0 | (f + Math.imul(I, ce))),
                  (r = 0 | (r + Math.imul(S, be))),
                  (n = 0 | (n + Math.imul(S, pe))),
                  (n = 0 | (n + Math.imul(A, be))),
                  (f = 0 | (f + Math.imul(A, pe)));
                var ke = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (ke >>> 26))),
                  (ke &= 67108863),
                  (r = Math.imul(j, ie)),
                  (n = Math.imul(j, re)),
                  (n = 0 | (n + Math.imul(X, ie))),
                  (f = Math.imul(X, re)),
                  (r = 0 | (r + Math.imul(C, fe))),
                  (n = 0 | (n + Math.imul(C, ae))),
                  (n = 0 | (n + Math.imul(B, fe))),
                  (f = 0 | (f + Math.imul(B, ae))),
                  (r = 0 | (r + Math.imul(q, se))),
                  (n = 0 | (n + Math.imul(q, oe))),
                  (n = 0 | (n + Math.imul(P, se))),
                  (f = 0 | (f + Math.imul(P, oe))),
                  (r = 0 | (r + Math.imul(k, ue))),
                  (n = 0 | (n + Math.imul(k, ce))),
                  (n = 0 | (n + Math.imul(H, ue))),
                  (f = 0 | (f + Math.imul(H, ce))),
                  (r = 0 | (r + Math.imul(R, be))),
                  (n = 0 | (n + Math.imul(R, pe))),
                  (n = 0 | (n + Math.imul(I, be))),
                  (f = 0 | (f + Math.imul(I, pe)));
                var He = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (He >>> 26))),
                  (He &= 67108863),
                  (r = Math.imul(j, fe)),
                  (n = Math.imul(j, ae)),
                  (n = 0 | (n + Math.imul(X, fe))),
                  (f = Math.imul(X, ae)),
                  (r = 0 | (r + Math.imul(C, se))),
                  (n = 0 | (n + Math.imul(C, oe))),
                  (n = 0 | (n + Math.imul(B, se))),
                  (f = 0 | (f + Math.imul(B, oe))),
                  (r = 0 | (r + Math.imul(q, ue))),
                  (n = 0 | (n + Math.imul(q, ce))),
                  (n = 0 | (n + Math.imul(P, ue))),
                  (f = 0 | (f + Math.imul(P, ce))),
                  (r = 0 | (r + Math.imul(k, be))),
                  (n = 0 | (n + Math.imul(k, pe))),
                  (n = 0 | (n + Math.imul(H, be))),
                  (f = 0 | (f + Math.imul(H, pe)));
                var ze = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (ze >>> 26))),
                  (ze &= 67108863),
                  (r = Math.imul(j, se)),
                  (n = Math.imul(j, oe)),
                  (n = 0 | (n + Math.imul(X, se))),
                  (f = Math.imul(X, oe)),
                  (r = 0 | (r + Math.imul(C, ue))),
                  (n = 0 | (n + Math.imul(C, ce))),
                  (n = 0 | (n + Math.imul(B, ue))),
                  (f = 0 | (f + Math.imul(B, ce))),
                  (r = 0 | (r + Math.imul(q, be))),
                  (n = 0 | (n + Math.imul(q, pe))),
                  (n = 0 | (n + Math.imul(P, be))),
                  (f = 0 | (f + Math.imul(P, pe)));
                var qe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (qe >>> 26))),
                  (qe &= 67108863),
                  (r = Math.imul(j, ue)),
                  (n = Math.imul(j, ce)),
                  (n = 0 | (n + Math.imul(X, ue))),
                  (f = Math.imul(X, ce)),
                  (r = 0 | (r + Math.imul(C, be))),
                  (n = 0 | (n + Math.imul(C, pe))),
                  (n = 0 | (n + Math.imul(B, be))),
                  (f = 0 | (f + Math.imul(B, pe)));
                var Pe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                (o = 0 | ((0 | (f + (n >>> 13))) + (Pe >>> 26))),
                  (Pe &= 67108863),
                  (r = Math.imul(j, be)),
                  (n = Math.imul(j, pe)),
                  (n = 0 | (n + Math.imul(X, be))),
                  (f = Math.imul(X, pe));
                var Oe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
                return (
                  (o = 0 | ((0 | (f + (n >>> 13))) + (Oe >>> 26))),
                  (Oe &= 67108863),
                  (s[0] = me),
                  (s[1] = ve),
                  (s[2] = ye),
                  (s[3] = ge),
                  (s[4] = Me),
                  (s[5] = we),
                  (s[6] = _e),
                  (s[7] = Se),
                  (s[8] = Ae),
                  (s[9] = xe),
                  (s[10] = Re),
                  (s[11] = Ie),
                  (s[12] = Ee),
                  (s[13] = ke),
                  (s[14] = He),
                  (s[15] = ze),
                  (s[16] = qe),
                  (s[17] = Pe),
                  (s[18] = Oe),
                  0 !== o && ((s[19] = o), i.length++),
                  i
                );
              };
              Math.imul || (x = o),
                (f.prototype.mulTo = function (t, e) {
                  var i,
                    r = this.length + t.length;
                  return (i =
                    10 === this.length && 10 === t.length ? x(this, t, e) : 63 > r ? o(this, t, e) : 1024 > r ? d(this, t, e) : u(this, t, e));
                }),
                (c.prototype.makeRBT = function (t) {
                  for (var e = Array(t), i = f.prototype._countBits(t) - 1, r = 0; t > r; r++) e[r] = this.revBin(r, i, t);
                  return e;
                }),
                (c.prototype.revBin = function (t, e, i) {
                  if (0 === t || t === i - 1) return t;
                  for (var r = 0, n = 0; e > n; n++) (r |= (1 & t) << (e - n - 1)), (t >>= 1);
                  return r;
                }),
                (c.prototype.permute = function (t, e, i, r, n, f) {
                  for (var a = 0; f > a; a++) (r[a] = e[t[a]]), (n[a] = i[t[a]]);
                }),
                (c.prototype.transform = function (t, e, i, r, n, f) {
                  this.permute(f, t, e, i, r, n);
                  for (var a = 1; n > a; a <<= 1)
                    for (var h = a << 1, s = Math.cos((2 * Math.PI) / h), o = Math.sin((2 * Math.PI) / h), d = 0; n > d; d += h)
                      for (var u = s, c = o, l = 0; a > l; l++) {
                        var b = i[d + l],
                          p = r[d + l],
                          m = i[d + l + a],
                          v = r[d + l + a],
                          y = u * m - c * v;
                        (v = u * v + c * m),
                          (m = y),
                          (i[d + l] = b + m),
                          (r[d + l] = p + v),
                          (i[d + l + a] = b - m),
                          (r[d + l + a] = p - v),
                          l !== h && ((y = s * u - o * c), (c = s * c + o * u), (u = y));
                      }
                }),
                (c.prototype.guessLen13b = function (t, e) {
                  var i = 1 | Math.max(e, t),
                    r = 1 & i,
                    n = 0;
                  for (i = 0 | (i / 2); i; i >>>= 1) n++;
                  return 1 << (n + 1 + r);
                }),
                (c.prototype.conjugate = function (t, e, i) {
                  if (!(1 >= i))
                    for (var r = 0; i / 2 > r; r++) {
                      var n = t[r];
                      (t[r] = t[i - r - 1]), (t[i - r - 1] = n), (n = e[r]), (e[r] = -e[i - r - 1]), (e[i - r - 1] = -n);
                    }
                }),
                (c.prototype.normalize13b = function (t, e) {
                  for (var i = 0, r = 0; e / 2 > r; r++) {
                    var n = 8192 * Math.round(t[2 * r + 1] / e) + Math.round(t[2 * r] / e) + i;
                    (t[r] = 67108863 & n), (i = 67108864 > n ? 0 : 0 | (n / 67108864));
                  }
                  return t;
                }),
                (c.prototype.convert13b = function (t, e, i, n) {
                  for (var f = 0, a = 0; e > a; a++) (f += 0 | t[a]), (i[2 * a] = 8191 & f), (f >>>= 13), (i[2 * a + 1] = 8191 & f), (f >>>= 13);
                  for (a = 2 * e; n > a; ++a) i[a] = 0;
                  r(0 === f), r(0 === (-8192 & f));
                }),
                (c.prototype.stub = function (t) {
                  for (var e = Array(t), i = 0; t > i; i++) e[i] = 0;
                  return e;
                }),
                (c.prototype.mulp = function (t, e, i) {
                  var r = 2 * this.guessLen13b(t.length, e.length),
                    n = this.makeRBT(r),
                    f = this.stub(r),
                    a = Array(r),
                    h = Array(r),
                    s = Array(r),
                    o = Array(r),
                    d = Array(r),
                    u = Array(r),
                    c = i.words;
                  (c.length = r),
                    this.convert13b(t.words, t.length, a, r),
                    this.convert13b(e.words, e.length, o, r),
                    this.transform(a, f, h, s, r, n),
                    this.transform(o, f, d, u, r, n);
                  for (var l = 0; r > l; l++) {
                    var b = h[l] * d[l] - s[l] * u[l];
                    (s[l] = h[l] * u[l] + s[l] * d[l]), (h[l] = b);
                  }
                  return (
                    this.conjugate(h, s, r),
                    this.transform(h, s, c, f, r, n),
                    this.conjugate(c, f, r),
                    this.normalize13b(c, r),
                    (i.negative = t.negative ^ e.negative),
                    (i.length = t.length + e.length),
                    i.strip()
                  );
                }),
                (f.prototype.mul = function (t) {
                  var e = new f(null);
                  return (e.words = Array(this.length + t.length)), this.mulTo(t, e);
                }),
                (f.prototype.mulf = function (t) {
                  var e = new f(null);
                  return (e.words = Array(this.length + t.length)), u(this, t, e);
                }),
                (f.prototype.imul = function (t) {
                  return this.clone().mulTo(t, this);
                }),
                (f.prototype.imuln = function (t) {
                  r("number" == typeof t), r(67108864 > t);
                  for (var e = 0, i = 0; this.length > i; i++) {
                    var n = (0 | this.words[i]) * t,
                      f = (67108863 & n) + (67108863 & e);
                    (e >>= 26), (e += 0 | (n / 67108864)), (e += f >>> 26), (this.words[i] = 67108863 & f);
                  }
                  return 0 !== e && ((this.words[i] = e), this.length++), this;
                }),
                (f.prototype.muln = function (t) {
                  return this.clone().imuln(t);
                }),
                (f.prototype.sqr = function () {
                  return this.mul(this);
                }),
                (f.prototype.isqr = function () {
                  return this.imul(this.clone());
                }),
                (f.prototype.pow = function (t) {
                  var e = s(t);
                  if (0 === e.length) return new f(1);
                  for (var i = this, r = 0; e.length > r && 0 === e[r]; r++, i = i.sqr());
                  if (++r < e.length) for (var n = i.sqr(); e.length > r; r++, n = n.sqr()) 0 !== e[r] && (i = i.mul(n));
                  return i;
                }),
                (f.prototype.iushln = function (t) {
                  r("number" == typeof t && t >= 0);
                  var e,
                    i = t % 26,
                    n = (t - i) / 26,
                    f = (67108863 >>> (26 - i)) << (26 - i);
                  if (0 !== i) {
                    var a = 0;
                    for (e = 0; this.length > e; e++) {
                      var h = this.words[e] & f,
                        s = ((0 | this.words[e]) - h) << i;
                      (this.words[e] = s | a), (a = h >>> (26 - i));
                    }
                    a && ((this.words[e] = a), this.length++);
                  }
                  if (0 !== n) {
                    for (e = this.length - 1; e >= 0; e--) this.words[e + n] = this.words[e];
                    for (e = 0; n > e; e++) this.words[e] = 0;
                    this.length += n;
                  }
                  return this.strip();
                }),
                (f.prototype.ishln = function (t) {
                  return r(0 === this.negative), this.iushln(t);
                }),
                (f.prototype.iushrn = function (t, e, i) {
                  r("number" == typeof t && t >= 0);
                  var n;
                  n = e ? (e - (e % 26)) / 26 : 0;
                  var f = t % 26,
                    a = Math.min((t - f) / 26, this.length),
                    h = 67108863 ^ ((67108863 >>> f) << f),
                    s = i;
                  if (((n -= a), (n = Math.max(0, n)), s)) {
                    for (var o = 0; a > o; o++) s.words[o] = this.words[o];
                    s.length = a;
                  }
                  if (0 === a);
                  else if (this.length > a) for (this.length -= a, o = 0; this.length > o; o++) this.words[o] = this.words[o + a];
                  else (this.words[0] = 0), (this.length = 1);
                  var d = 0;
                  for (o = this.length - 1; o >= 0 && (0 !== d || o >= n); o--) {
                    var u = 0 | this.words[o];
                    (this.words[o] = (d << (26 - f)) | (u >>> f)), (d = u & h);
                  }
                  return s && 0 !== d && (s.words[s.length++] = d), 0 === this.length && ((this.words[0] = 0), (this.length = 1)), this.strip();
                }),
                (f.prototype.ishrn = function (t, e, i) {
                  return r(0 === this.negative), this.iushrn(t, e, i);
                }),
                (f.prototype.shln = function (t) {
                  return this.clone().ishln(t);
                }),
                (f.prototype.ushln = function (t) {
                  return this.clone().iushln(t);
                }),
                (f.prototype.shrn = function (t) {
                  return this.clone().ishrn(t);
                }),
                (f.prototype.ushrn = function (t) {
                  return this.clone().iushrn(t);
                }),
                (f.prototype.testn = function (t) {
                  r("number" == typeof t && t >= 0);
                  var e = t % 26,
                    i = (t - e) / 26,
                    n = 1 << e;
                  if (i >= this.length) return !1;
                  var f = this.words[i];
                  return !!(f & n);
                }),
                (f.prototype.imaskn = function (t) {
                  r("number" == typeof t && t >= 0);
                  var e = t % 26,
                    i = (t - e) / 26;
                  if ((r(0 === this.negative, "imaskn works only with positive numbers"), i >= this.length)) return this;
                  if ((0 !== e && i++, (this.length = Math.min(i, this.length)), 0 !== e)) {
                    var n = 67108863 ^ ((67108863 >>> e) << e);
                    this.words[this.length - 1] &= n;
                  }
                  return this.strip();
                }),
                (f.prototype.maskn = function (t) {
                  return this.clone().imaskn(t);
                }),
                (f.prototype.iaddn = function (t) {
                  return (
                    r("number" == typeof t),
                    r(67108864 > t),
                    0 > t
                      ? this.isubn(-t)
                      : 0 !== this.negative
                      ? 1 === this.length && t > (0 | this.words[0])
                        ? ((this.words[0] = t - (0 | this.words[0])), (this.negative = 0), this)
                        : ((this.negative = 0), this.isubn(t), (this.negative = 1), this)
                      : this._iaddn(t)
                  );
                }),
                (f.prototype._iaddn = function (t) {
                  this.words[0] += t;
                  for (var e = 0; this.length > e && this.words[e] >= 67108864; e++)
                    (this.words[e] -= 67108864), e === this.length - 1 ? (this.words[e + 1] = 1) : this.words[e + 1]++;
                  return (this.length = Math.max(this.length, e + 1)), this;
                }),
                (f.prototype.isubn = function (t) {
                  if ((r("number" == typeof t), r(67108864 > t), 0 > t)) return this.iaddn(-t);
                  if (0 !== this.negative) return (this.negative = 0), this.iaddn(t), (this.negative = 1), this;
                  if (((this.words[0] -= t), 1 === this.length && 0 > this.words[0])) (this.words[0] = -this.words[0]), (this.negative = 1);
                  else for (var e = 0; this.length > e && 0 > this.words[e]; e++) (this.words[e] += 67108864), (this.words[e + 1] -= 1);
                  return this.strip();
                }),
                (f.prototype.addn = function (t) {
                  return this.clone().iaddn(t);
                }),
                (f.prototype.subn = function (t) {
                  return this.clone().isubn(t);
                }),
                (f.prototype.iabs = function () {
                  return (this.negative = 0), this;
                }),
                (f.prototype.abs = function () {
                  return this.clone().iabs();
                }),
                (f.prototype._ishlnsubmul = function (t, e, i) {
                  var n,
                    f = t.length + i;
                  this._expand(f);
                  var a,
                    h = 0;
                  for (n = 0; t.length > n; n++) {
                    a = (0 | this.words[n + i]) + h;
                    var s = (0 | t.words[n]) * e;
                    (a -= 67108863 & s), (h = (a >> 26) - (0 | (s / 67108864))), (this.words[n + i] = 67108863 & a);
                  }
                  for (; this.length - i > n; n++) (a = (0 | this.words[n + i]) + h), (h = a >> 26), (this.words[n + i] = 67108863 & a);
                  if (0 === h) return this.strip();
                  for (r(-1 === h), h = 0, n = 0; this.length > n; n++) (a = -(0 | this.words[n]) + h), (h = a >> 26), (this.words[n] = 67108863 & a);
                  return (this.negative = 1), this.strip();
                }),
                (f.prototype._wordDiv = function (t, e) {
                  var i = this.length - t.length,
                    r = this.clone(),
                    n = t,
                    a = 0 | n.words[n.length - 1],
                    h = this._countBits(a);
                  (i = 26 - h), 0 !== i && ((n = n.ushln(i)), r.iushln(i), (a = 0 | n.words[n.length - 1]));
                  var s,
                    o = r.length - n.length;
                  if ("mod" !== e) {
                    (s = new f(null)), (s.length = o + 1), (s.words = Array(s.length));
                    for (var d = 0; s.length > d; d++) s.words[d] = 0;
                  }
                  var u = r.clone()._ishlnsubmul(n, 1, o);
                  0 === u.negative && ((r = u), s && (s.words[o] = 1));
                  for (var c = o - 1; c >= 0; c--) {
                    var l = 67108864 * (0 | r.words[n.length + c]) + (0 | r.words[n.length + c - 1]);
                    for (l = Math.min(0 | (l / a), 67108863), r._ishlnsubmul(n, l, c); 0 !== r.negative; )
                      l--, (r.negative = 0), r._ishlnsubmul(n, 1, c), r.isZero() || (r.negative ^= 1);
                    s && (s.words[c] = l);
                  }
                  return s && s.strip(), r.strip(), "div" !== e && 0 !== i && r.iushrn(i), { div: s || null, mod: r };
                }),
                (f.prototype.divmod = function (t, e, i) {
                  if ((r(!t.isZero()), this.isZero())) return { div: new f(0), mod: new f(0) };
                  var n, a, h;
                  return 0 !== this.negative && 0 === t.negative
                    ? ((h = this.neg().divmod(t, e)),
                      "mod" !== e && (n = h.div.neg()),
                      "div" !== e && ((a = h.mod.neg()), i && 0 !== a.negative && a.iadd(t)),
                      { div: n, mod: a })
                    : 0 === this.negative && 0 !== t.negative
                    ? ((h = this.divmod(t.neg(), e)), "mod" !== e && (n = h.div.neg()), { div: n, mod: h.mod })
                    : 0 !== (this.negative & t.negative)
                    ? ((h = this.neg().divmod(t.neg(), e)),
                      "div" !== e && ((a = h.mod.neg()), i && 0 !== a.negative && a.isub(t)),
                      { div: h.div, mod: a })
                    : t.length > this.length || 0 > this.cmp(t)
                    ? { div: new f(0), mod: this }
                    : 1 === t.length
                    ? "div" === e
                      ? { div: this.divn(t.words[0]), mod: null }
                      : "mod" === e
                      ? { div: null, mod: new f(this.modn(t.words[0])) }
                      : { div: this.divn(t.words[0]), mod: new f(this.modn(t.words[0])) }
                    : this._wordDiv(t, e);
                }),
                (f.prototype.div = function (t) {
                  return this.divmod(t, "div", !1).div;
                }),
                (f.prototype.mod = function (t) {
                  return this.divmod(t, "mod", !1).mod;
                }),
                (f.prototype.umod = function (t) {
                  return this.divmod(t, "mod", !0).mod;
                }),
                (f.prototype.divRound = function (t) {
                  var e = this.divmod(t);
                  if (e.mod.isZero()) return e.div;
                  var i = 0 !== e.div.negative ? e.mod.isub(t) : e.mod,
                    r = t.ushrn(1),
                    n = t.andln(1),
                    f = i.cmp(r);
                  return 0 > f || (1 === n && 0 === f) ? e.div : 0 !== e.div.negative ? e.div.isubn(1) : e.div.iaddn(1);
                }),
                (f.prototype.modn = function (t) {
                  r(67108863 >= t);
                  for (var e = (1 << 26) % t, i = 0, n = this.length - 1; n >= 0; n--) i = (e * i + (0 | this.words[n])) % t;
                  return i;
                }),
                (f.prototype.idivn = function (t) {
                  r(67108863 >= t);
                  for (var e = 0, i = this.length - 1; i >= 0; i--) {
                    var n = (0 | this.words[i]) + 67108864 * e;
                    (this.words[i] = 0 | (n / t)), (e = n % t);
                  }
                  return this.strip();
                }),
                (f.prototype.divn = function (t) {
                  return this.clone().idivn(t);
                }),
                (f.prototype.egcd = function (t) {
                  r(0 === t.negative), r(!t.isZero());
                  var e = this,
                    i = t.clone();
                  e = 0 !== e.negative ? e.umod(t) : e.clone();
                  for (var n = new f(1), a = new f(0), h = new f(0), s = new f(1), o = 0; e.isEven() && i.isEven(); ) e.iushrn(1), i.iushrn(1), ++o;
                  for (var d = i.clone(), u = e.clone(); !e.isZero(); ) {
                    for (var c = 0, l = 1; 0 === (e.words[0] & l) && 26 > c; ++c, l <<= 1);
                    if (c > 0) for (e.iushrn(c); c-- > 0; ) (n.isOdd() || a.isOdd()) && (n.iadd(d), a.isub(u)), n.iushrn(1), a.iushrn(1);
                    for (var b = 0, p = 1; 0 === (i.words[0] & p) && 26 > b; ++b, p <<= 1);
                    if (b > 0) for (i.iushrn(b); b-- > 0; ) (h.isOdd() || s.isOdd()) && (h.iadd(d), s.isub(u)), h.iushrn(1), s.iushrn(1);
                    e.cmp(i) >= 0 ? (e.isub(i), n.isub(h), a.isub(s)) : (i.isub(e), h.isub(n), s.isub(a));
                  }
                  return { a: h, b: s, gcd: i.iushln(o) };
                }),
                (f.prototype._invmp = function (t) {
                  r(0 === t.negative), r(!t.isZero());
                  var e = this,
                    i = t.clone();
                  e = 0 !== e.negative ? e.umod(t) : e.clone();
                  for (var n = new f(1), a = new f(0), h = i.clone(); e.cmpn(1) > 0 && i.cmpn(1) > 0; ) {
                    for (var s = 0, o = 1; 0 === (e.words[0] & o) && 26 > s; ++s, o <<= 1);
                    if (s > 0) for (e.iushrn(s); s-- > 0; ) n.isOdd() && n.iadd(h), n.iushrn(1);
                    for (var d = 0, u = 1; 0 === (i.words[0] & u) && 26 > d; ++d, u <<= 1);
                    if (d > 0) for (i.iushrn(d); d-- > 0; ) a.isOdd() && a.iadd(h), a.iushrn(1);
                    e.cmp(i) >= 0 ? (e.isub(i), n.isub(a)) : (i.isub(e), a.isub(n));
                  }
                  var c;
                  return (c = 0 === e.cmpn(1) ? n : a), 0 > c.cmpn(0) && c.iadd(t), c;
                }),
                (f.prototype.gcd = function (t) {
                  if (this.isZero()) return t.abs();
                  if (t.isZero()) return this.abs();
                  var e = this.clone(),
                    i = t.clone();
                  (e.negative = 0), (i.negative = 0);
                  for (var r = 0; e.isEven() && i.isEven(); r++) e.iushrn(1), i.iushrn(1);
                  for (;;) {
                    for (; e.isEven(); ) e.iushrn(1);
                    for (; i.isEven(); ) i.iushrn(1);
                    var n = e.cmp(i);
                    if (0 > n) {
                      var f = e;
                      (e = i), (i = f);
                    } else if (0 === n || 0 === i.cmpn(1)) break;
                    e.isub(i);
                  }
                  return i.iushln(r);
                }),
                (f.prototype.invm = function (t) {
                  return this.egcd(t).a.umod(t);
                }),
                (f.prototype.isEven = function () {
                  return 0 === (1 & this.words[0]);
                }),
                (f.prototype.isOdd = function () {
                  return 1 === (1 & this.words[0]);
                }),
                (f.prototype.andln = function (t) {
                  return this.words[0] & t;
                }),
                (f.prototype.bincn = function (t) {
                  r("number" == typeof t);
                  var e = t % 26,
                    i = (t - e) / 26,
                    n = 1 << e;
                  if (i >= this.length) return this._expand(i + 1), (this.words[i] |= n), this;
                  for (var f = n, a = i; 0 !== f && this.length > a; a++) {
                    var h = 0 | this.words[a];
                    (h += f), (f = h >>> 26), (h &= 67108863), (this.words[a] = h);
                  }
                  return 0 !== f && ((this.words[a] = f), this.length++), this;
                }),
                (f.prototype.isZero = function () {
                  return 1 === this.length && 0 === this.words[0];
                }),
                (f.prototype.cmpn = function (t) {
                  var e = 0 > t;
                  if (0 !== this.negative && !e) return -1;
                  if (0 === this.negative && e) return 1;
                  this.strip();
                  var i;
                  if (this.length > 1) i = 1;
                  else {
                    e && (t = -t), r(67108863 >= t, "Number is too big");
                    var n = 0 | this.words[0];
                    i = n === t ? 0 : t > n ? -1 : 1;
                  }
                  return 0 !== this.negative ? 0 | -i : i;
                }),
                (f.prototype.cmp = function (t) {
                  if (0 !== this.negative && 0 === t.negative) return -1;
                  if (0 === this.negative && 0 !== t.negative) return 1;
                  var e = this.ucmp(t);
                  return 0 !== this.negative ? 0 | -e : e;
                }),
                (f.prototype.ucmp = function (t) {
                  if (this.length > t.length) return 1;
                  if (this.length < t.length) return -1;
                  for (var e = 0, i = this.length - 1; i >= 0; i--) {
                    var r = 0 | this.words[i],
                      n = 0 | t.words[i];
                    if (r !== n) {
                      n > r ? (e = -1) : r > n && (e = 1);
                      break;
                    }
                  }
                  return e;
                }),
                (f.prototype.gtn = function (t) {
                  return 1 === this.cmpn(t);
                }),
                (f.prototype.gt = function (t) {
                  return 1 === this.cmp(t);
                }),
                (f.prototype.gten = function (t) {
                  return this.cmpn(t) >= 0;
                }),
                (f.prototype.gte = function (t) {
                  return this.cmp(t) >= 0;
                }),
                (f.prototype.ltn = function (t) {
                  return -1 === this.cmpn(t);
                }),
                (f.prototype.lt = function (t) {
                  return -1 === this.cmp(t);
                }),
                (f.prototype.lten = function (t) {
                  return 0 >= this.cmpn(t);
                }),
                (f.prototype.lte = function (t) {
                  return 0 >= this.cmp(t);
                }),
                (f.prototype.eqn = function (t) {
                  return 0 === this.cmpn(t);
                }),
                (f.prototype.eq = function (t) {
                  return 0 === this.cmp(t);
                }),
                (f.red = function (t) {
                  return new y(t);
                }),
                (f.prototype.toRed = function (t) {
                  return (
                    r(!this.red, "Already a number in reduction context"),
                    r(0 === this.negative, "red works only with positives"),
                    t.convertTo(this)._forceRed(t)
                  );
                }),
                (f.prototype.fromRed = function () {
                  return r(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
                }),
                (f.prototype._forceRed = function (t) {
                  return (this.red = t), this;
                }),
                (f.prototype.forceRed = function (t) {
                  return r(!this.red, "Already a number in reduction context"), this._forceRed(t);
                }),
                (f.prototype.redAdd = function (t) {
                  return r(this.red, "redAdd works only with red numbers"), this.red.add(this, t);
                }),
                (f.prototype.redIAdd = function (t) {
                  return r(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, t);
                }),
                (f.prototype.redSub = function (t) {
                  return r(this.red, "redSub works only with red numbers"), this.red.sub(this, t);
                }),
                (f.prototype.redISub = function (t) {
                  return r(this.red, "redISub works only with red numbers"), this.red.isub(this, t);
                }),
                (f.prototype.redShl = function (t) {
                  return r(this.red, "redShl works only with red numbers"), this.red.shl(this, t);
                }),
                (f.prototype.redMul = function (t) {
                  return r(this.red, "redMul works only with red numbers"), this.red._verify2(this, t), this.red.mul(this, t);
                }),
                (f.prototype.redIMul = function (t) {
                  return r(this.red, "redMul works only with red numbers"), this.red._verify2(this, t), this.red.imul(this, t);
                }),
                (f.prototype.redSqr = function () {
                  return r(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
                }),
                (f.prototype.redISqr = function () {
                  return r(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
                }),
                (f.prototype.redSqrt = function () {
                  return r(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
                }),
                (f.prototype.redInvm = function () {
                  return r(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
                }),
                (f.prototype.redNeg = function () {
                  return r(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
                }),
                (f.prototype.redPow = function (t) {
                  return r(this.red && !t.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, t);
                });
              var R = { k256: null, p224: null, p192: null, p25519: null };
              (l.prototype._tmp = function () {
                var t = new f(null);
                return (t.words = Array(Math.ceil(this.n / 13))), t;
              }),
                (l.prototype.ireduce = function (t) {
                  var e,
                    i = t;
                  do this.split(i, this.tmp), (i = this.imulK(i)), (i = i.iadd(this.tmp)), (e = i.bitLength());
                  while (e > this.n);
                  var r = this.n > e ? -1 : i.ucmp(this.p);
                  return 0 === r ? ((i.words[0] = 0), (i.length = 1)) : r > 0 ? i.isub(this.p) : i.strip(), i;
                }),
                (l.prototype.split = function (t, e) {
                  t.iushrn(this.n, 0, e);
                }),
                (l.prototype.imulK = function (t) {
                  return t.imul(this.k);
                }),
                n(b, l),
                (b.prototype.split = function (t, e) {
                  for (var i = 4194303, r = Math.min(t.length, 9), n = 0; r > n; n++) e.words[n] = t.words[n];
                  if (((e.length = r), 9 >= t.length)) return (t.words[0] = 0), (t.length = 1), void 0;
                  var f = t.words[9];
                  for (e.words[e.length++] = f & i, n = 10; t.length > n; n++) {
                    var a = 0 | t.words[n];
                    (t.words[n - 10] = ((a & i) << 4) | (f >>> 22)), (f = a);
                  }
                  (f >>>= 22), (t.words[n - 10] = f), (t.length -= 0 === f && t.length > 10 ? 10 : 9);
                }),
                (b.prototype.imulK = function (t) {
                  (t.words[t.length] = 0), (t.words[t.length + 1] = 0), (t.length += 2);
                  for (var e = 0, i = 0; t.length > i; i++) {
                    var r = 0 | t.words[i];
                    (e += 977 * r), (t.words[i] = 67108863 & e), (e = 64 * r + (0 | (e / 67108864)));
                  }
                  return 0 === t.words[t.length - 1] && (t.length--, 0 === t.words[t.length - 1] && t.length--), t;
                }),
                n(p, l),
                n(m, l),
                n(v, l),
                (v.prototype.imulK = function (t) {
                  for (var e = 0, i = 0; t.length > i; i++) {
                    var r = 19 * (0 | t.words[i]) + e,
                      n = 67108863 & r;
                    (r >>>= 26), (t.words[i] = n), (e = r);
                  }
                  return 0 !== e && (t.words[t.length++] = e), t;
                }),
                (f._prime = function (t) {
                  if (R[t]) return R[t];
                  var e;
                  if ("k256" === t) e = new b();
                  else if ("p224" === t) e = new p();
                  else if ("p192" === t) e = new m();
                  else {
                    if ("p25519" !== t) throw Error("Unknown prime " + t);
                    e = new v();
                  }
                  return (R[t] = e), e;
                }),
                (y.prototype._verify1 = function (t) {
                  r(0 === t.negative, "red works only with positives"), r(t.red, "red works only with red numbers");
                }),
                (y.prototype._verify2 = function (t, e) {
                  r(0 === (t.negative | e.negative), "red works only with positives"), r(t.red && t.red === e.red, "red works only with red numbers");
                }),
                (y.prototype.imod = function (t) {
                  return this.prime ? this.prime.ireduce(t)._forceRed(this) : t.umod(this.m)._forceRed(this);
                }),
                (y.prototype.neg = function (t) {
                  return t.isZero() ? t.clone() : this.m.sub(t)._forceRed(this);
                }),
                (y.prototype.add = function (t, e) {
                  this._verify2(t, e);
                  var i = t.add(e);
                  return i.cmp(this.m) >= 0 && i.isub(this.m), i._forceRed(this);
                }),
                (y.prototype.iadd = function (t, e) {
                  this._verify2(t, e);
                  var i = t.iadd(e);
                  return i.cmp(this.m) >= 0 && i.isub(this.m), i;
                }),
                (y.prototype.sub = function (t, e) {
                  this._verify2(t, e);
                  var i = t.sub(e);
                  return 0 > i.cmpn(0) && i.iadd(this.m), i._forceRed(this);
                }),
                (y.prototype.isub = function (t, e) {
                  this._verify2(t, e);
                  var i = t.isub(e);
                  return 0 > i.cmpn(0) && i.iadd(this.m), i;
                }),
                (y.prototype.shl = function (t, e) {
                  return this._verify1(t), this.imod(t.ushln(e));
                }),
                (y.prototype.imul = function (t, e) {
                  return this._verify2(t, e), this.imod(t.imul(e));
                }),
                (y.prototype.mul = function (t, e) {
                  return this._verify2(t, e), this.imod(t.mul(e));
                }),
                (y.prototype.isqr = function (t) {
                  return this.imul(t, t.clone());
                }),
                (y.prototype.sqr = function (t) {
                  return this.mul(t, t);
                }),
                (y.prototype.sqrt = function (t) {
                  if (t.isZero()) return t.clone();
                  var e = this.m.andln(3);
                  if ((r(1 === e % 2), 3 === e)) {
                    var i = this.m.add(new f(1)).iushrn(2);
                    return this.pow(t, i);
                  }
                  for (var n = this.m.subn(1), a = 0; !n.isZero() && 0 === n.andln(1); ) a++, n.iushrn(1);
                  r(!n.isZero());
                  var h = new f(1).toRed(this),
                    s = h.redNeg(),
                    o = this.m.subn(1).iushrn(1),
                    d = this.m.bitLength();
                  for (d = new f(2 * d * d).toRed(this); 0 !== this.pow(d, o).cmp(s); ) d.redIAdd(s);
                  for (var u = this.pow(d, n), c = this.pow(t, n.addn(1).iushrn(1)), l = this.pow(t, n), b = a; 0 !== l.cmp(h); ) {
                    for (var p = l, m = 0; 0 !== p.cmp(h); m++) p = p.redSqr();
                    r(b > m);
                    var v = this.pow(u, new f(1).iushln(b - m - 1));
                    (c = c.redMul(v)), (u = v.redSqr()), (l = l.redMul(u)), (b = m);
                  }
                  return c;
                }),
                (y.prototype.invm = function (t) {
                  var e = t._invmp(this.m);
                  return 0 !== e.negative ? ((e.negative = 0), this.imod(e).redNeg()) : this.imod(e);
                }),
                (y.prototype.pow = function (t, e) {
                  if (e.isZero()) return new f(1);
                  if (0 === e.cmpn(1)) return t.clone();
                  var i = 4,
                    r = Array(1 << i);
                  (r[0] = new f(1).toRed(this)), (r[1] = t);
                  for (var n = 2; r.length > n; n++) r[n] = this.mul(r[n - 1], t);
                  var a = r[0],
                    h = 0,
                    s = 0,
                    o = e.bitLength() % 26;
                  for (0 === o && (o = 26), n = e.length - 1; n >= 0; n--) {
                    for (var d = e.words[n], u = o - 1; u >= 0; u--) {
                      var c = 1 & (d >> u);
                      a !== r[0] && (a = this.sqr(a)),
                        0 !== c || 0 !== h
                          ? ((h <<= 1), (h |= c), s++, (s === i || (0 === n && 0 === u)) && ((a = this.mul(a, r[h])), (s = 0), (h = 0)))
                          : (s = 0);
                    }
                    o = 26;
                  }
                  return a;
                }),
                (y.prototype.convertTo = function (t) {
                  var e = t.umod(this.m);
                  return e === t ? e.clone() : e;
                }),
                (y.prototype.convertFrom = function (t) {
                  var e = t.clone();
                  return (e.red = null), e;
                }),
                (f.mont = function (t) {
                  return new g(t);
                }),
                n(g, y),
                (g.prototype.convertTo = function (t) {
                  return this.imod(t.ushln(this.shift));
                }),
                (g.prototype.convertFrom = function (t) {
                  var e = this.imod(t.mul(this.rinv));
                  return (e.red = null), e;
                }),
                (g.prototype.imul = function (t, e) {
                  if (t.isZero() || e.isZero()) return (t.words[0] = 0), (t.length = 1), t;
                  var i = t.imul(e),
                    r = i.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
                    n = i.isub(r).iushrn(this.shift),
                    f = n;
                  return n.cmp(this.m) >= 0 ? (f = n.isub(this.m)) : 0 > n.cmpn(0) && (f = n.iadd(this.m)), f._forceRed(this);
                }),
                (g.prototype.mul = function (t, e) {
                  if (t.isZero() || e.isZero()) return new f(0)._forceRed(this);
                  var i = t.mul(e),
                    r = i.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
                    n = i.isub(r).iushrn(this.shift),
                    a = n;
                  return n.cmp(this.m) >= 0 ? (a = n.isub(this.m)) : 0 > n.cmpn(0) && (a = n.iadd(this.m)), a._forceRed(this);
                }),
                (g.prototype.invm = function (t) {
                  var e = this.imod(t._invmp(this.m).mul(this.r2));
                  return e._forceRed(this);
                });
            })(e === void 0 || e, this);
          },
          {},
        ],
        17: [
          function (t, e) {
            function i(t) {
              this.rand = t;
            }
            var r;
            if (
              ((e.exports = function (t) {
                return r || (r = new i(null)), r.generate(t);
              }),
              (e.exports.Rand = i),
              (i.prototype.generate = function (t) {
                return this._rand(t);
              }),
              "object" == typeof self)
            )
              i.prototype._rand =
                self.crypto && self.crypto.getRandomValues
                  ? function (t) {
                      var e = new Uint8Array(t);
                      return self.crypto.getRandomValues(e), e;
                    }
                  : self.msCrypto && self.msCrypto.getRandomValues
                  ? function (t) {
                      var e = new Uint8Array(t);
                      return self.msCrypto.getRandomValues(e), e;
                    }
                  : function () {
                      throw Error("Not implemented yet");
                    };
            else
              try {
                var n = t("crypto");
                i.prototype._rand = function (t) {
                  return n.randomBytes(t);
                };
              } catch (f) {
                i.prototype._rand = function (t) {
                  for (var e = new Uint8Array(t), i = 0; e.length > i; i++) e[i] = this.rand.getByte();
                  return e;
                };
              }
          },
          { crypto: 18 },
        ],
        18: [function () {}, {}],
        19: [
          function (t, e, i) {
            var r = i;
            (r.utils = t("./hash/utils")),
              (r.common = t("./hash/common")),
              (r.sha = t("./hash/sha")),
              (r.ripemd = t("./hash/ripemd")),
              (r.hmac = t("./hash/hmac")),
              (r.sha1 = r.sha.sha1),
              (r.sha256 = r.sha.sha256),
              (r.sha224 = r.sha.sha224),
              (r.sha384 = r.sha.sha384),
              (r.sha512 = r.sha.sha512),
              (r.ripemd160 = r.ripemd.ripemd160);
          },
          { "./hash/common": 20, "./hash/hmac": 21, "./hash/ripemd": 22, "./hash/sha": 23, "./hash/utils": 24 },
        ],
        20: [
          function (t, e, i) {
            function r() {
              (this.pending = null),
                (this.pendingTotal = 0),
                (this.blockSize = this.constructor.blockSize),
                (this.outSize = this.constructor.outSize),
                (this.hmacStrength = this.constructor.hmacStrength),
                (this.padLength = this.constructor.padLength / 8),
                (this.endian = "big"),
                (this._delta8 = this.blockSize / 8),
                (this._delta32 = this.blockSize / 32);
            }
            var n = t("../hash"),
              f = n.utils,
              a = f.assert;
            (i.BlockHash = r),
              (r.prototype.update = function (t, e) {
                if (
                  ((t = f.toArray(t, e)),
                  (this.pending = this.pending ? this.pending.concat(t) : t),
                  (this.pendingTotal += t.length),
                  this.pending.length >= this._delta8)
                ) {
                  t = this.pending;
                  var i = t.length % this._delta8;
                  (this.pending = t.slice(t.length - i, t.length)),
                    0 === this.pending.length && (this.pending = null),
                    (t = f.join32(t, 0, t.length - i, this.endian));
                  for (var r = 0; t.length > r; r += this._delta32) this._update(t, r, r + this._delta32);
                }
                return this;
              }),
              (r.prototype.digest = function (t) {
                return this.update(this._pad()), a(null === this.pending), this._digest(t);
              }),
              (r.prototype._pad = function () {
                var t = this.pendingTotal,
                  e = this._delta8,
                  i = e - ((t + this.padLength) % e),
                  r = Array(i + this.padLength);
                r[0] = 128;
                for (var n = 1; i > n; n++) r[n] = 0;
                if (((t <<= 3), "big" === this.endian)) {
                  for (var f = 8; this.padLength > f; f++) r[n++] = 0;
                  (r[n++] = 0),
                    (r[n++] = 0),
                    (r[n++] = 0),
                    (r[n++] = 0),
                    (r[n++] = 255 & (t >>> 24)),
                    (r[n++] = 255 & (t >>> 16)),
                    (r[n++] = 255 & (t >>> 8)),
                    (r[n++] = 255 & t);
                } else {
                  (r[n++] = 255 & t),
                    (r[n++] = 255 & (t >>> 8)),
                    (r[n++] = 255 & (t >>> 16)),
                    (r[n++] = 255 & (t >>> 24)),
                    (r[n++] = 0),
                    (r[n++] = 0),
                    (r[n++] = 0),
                    (r[n++] = 0);
                  for (var f = 8; this.padLength > f; f++) r[n++] = 0;
                }
                return r;
              });
          },
          { "../hash": 19 },
        ],
        21: [
          function (t, e, i) {
            function r(t, e, i) {
              return this instanceof r
                ? ((this.Hash = t),
                  (this.blockSize = t.blockSize / 8),
                  (this.outSize = t.outSize / 8),
                  (this.inner = null),
                  (this.outer = null),
                  this._init(f.toArray(e, i)),
                  void 0)
                : new r(t, e, i);
            }
            var n = t("../hash"),
              f = n.utils,
              a = f.assert;
            (e.exports = r),
              (r.prototype._init = function (t) {
                t.length > this.blockSize && (t = new this.Hash().update(t).digest()), a(t.length <= this.blockSize);
                for (var e = t.length; this.blockSize > e; e++) t.push(0);
                for (var e = 0; t.length > e; e++) t[e] ^= 54;
                this.inner = new this.Hash().update(t);
                for (var e = 0; t.length > e; e++) t[e] ^= 106;
                this.outer = new this.Hash().update(t);
              }),
              (r.prototype.update = function (t, e) {
                return this.inner.update(t, e), this;
              }),
              (r.prototype.digest = function (t) {
                return this.outer.update(this.inner.digest()), this.outer.digest(t);
              });
          },
          { "../hash": 19 },
        ],
        22: [
          function (t, e, i) {
            function r() {
              return this instanceof r
                ? (l.call(this), (this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520]), (this.endian = "little"), void 0)
                : new r();
            }
            function n(t, e, i, r) {
              return 15 >= t ? e ^ i ^ r : 31 >= t ? (e & i) | (~e & r) : 47 >= t ? (e | ~i) ^ r : 63 >= t ? (e & r) | (i & ~r) : e ^ (i | ~r);
            }
            function f(t) {
              return 15 >= t ? 0 : 31 >= t ? 1518500249 : 47 >= t ? 1859775393 : 63 >= t ? 2400959708 : 2840853838;
            }
            function a(t) {
              return 15 >= t ? 1352829926 : 31 >= t ? 1548603684 : 47 >= t ? 1836072691 : 63 >= t ? 2053994217 : 0;
            }
            var h = t("../hash"),
              s = h.utils,
              o = s.rotl32,
              d = s.sum32,
              u = s.sum32_3,
              c = s.sum32_4,
              l = h.common.BlockHash;
            s.inherits(r, l),
              (i.ripemd160 = r),
              (r.blockSize = 512),
              (r.outSize = 160),
              (r.hmacStrength = 192),
              (r.padLength = 64),
              (r.prototype._update = function (t, e) {
                for (
                  var i = this.h[0], r = this.h[1], h = this.h[2], s = this.h[3], l = this.h[4], y = i, g = r, M = h, w = s, _ = l, S = 0;
                  80 > S;
                  S++
                ) {
                  var A = d(o(c(i, n(S, r, h, s), t[b[S] + e], f(S)), m[S]), l);
                  (i = l),
                    (l = s),
                    (s = o(h, 10)),
                    (h = r),
                    (r = A),
                    (A = d(o(c(y, n(79 - S, g, M, w), t[p[S] + e], a(S)), v[S]), _)),
                    (y = _),
                    (_ = w),
                    (w = o(M, 10)),
                    (M = g),
                    (g = A);
                }
                (A = u(this.h[1], h, w)),
                  (this.h[1] = u(this.h[2], s, _)),
                  (this.h[2] = u(this.h[3], l, y)),
                  (this.h[3] = u(this.h[4], i, g)),
                  (this.h[4] = u(this.h[0], r, M)),
                  (this.h[0] = A);
              }),
              (r.prototype._digest = function (t) {
                return "hex" === t ? s.toHex32(this.h, "little") : s.split32(this.h, "little");
              });
            var b = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1,
                2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
              ],
              p = [
                5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9,
                11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9,
                11,
              ],
              m = [
                11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9,
                13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14,
                11, 8, 5, 6,
              ],
              v = [
                8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6,
                14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15,
                13, 11, 11,
              ];
          },
          { "../hash": 19 },
        ],
        23: [
          function (t, e, i) {
            function r() {
              return this instanceof r
                ? (D.call(this),
                  (this.h = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]),
                  (this.k = W),
                  (this.W = Array(64)),
                  void 0)
                : new r();
            }
            function n() {
              return this instanceof n
                ? (r.call(this), (this.h = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428]), void 0)
                : new n();
            }
            function f() {
              return this instanceof f
                ? (D.call(this),
                  (this.h = [
                    1779033703, 4089235720, 3144134277, 2227873595, 1013904242, 4271175723, 2773480762, 1595750129, 1359893119, 2917565137,
                    2600822924, 725511199, 528734635, 4215389547, 1541459225, 327033209,
                  ]),
                  (this.k = V),
                  (this.W = Array(160)),
                  void 0)
                : new f();
            }
            function a() {
              return this instanceof a
                ? (f.call(this),
                  (this.h = [
                    3418070365, 3238371032, 1654270250, 914150663, 2438529370, 812702999, 355462360, 4144912697, 1731405415, 4290775857, 2394180231,
                    1750603025, 3675008525, 1694076839, 1203062813, 3204075428,
                  ]),
                  void 0)
                : new a();
            }
            function h() {
              return this instanceof h
                ? (D.call(this), (this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520]), (this.W = Array(80)), void 0)
                : new h();
            }
            function s(t, e, i) {
              return (t & e) ^ (~t & i);
            }
            function o(t, e, i) {
              return (t & e) ^ (t & i) ^ (e & i);
            }
            function d(t, e, i) {
              return t ^ e ^ i;
            }
            function u(t) {
              return z(t, 2) ^ z(t, 13) ^ z(t, 22);
            }
            function c(t) {
              return z(t, 6) ^ z(t, 11) ^ z(t, 25);
            }
            function l(t) {
              return z(t, 7) ^ z(t, 18) ^ (t >>> 3);
            }
            function b(t) {
              return z(t, 17) ^ z(t, 19) ^ (t >>> 10);
            }
            function p(t, e, i, r) {
              return 0 === t ? s(e, i, r) : 1 === t || 3 === t ? d(e, i, r) : 2 === t ? o(e, i, r) : void 0;
            }
            function m(t, e, i, r, n) {
              var f = (t & i) ^ (~t & n);
              return 0 > f && (f += 4294967296), f;
            }
            function v(t, e, i, r, n, f) {
              var a = (e & r) ^ (~e & f);
              return 0 > a && (a += 4294967296), a;
            }
            function y(t, e, i, r, n) {
              var f = (t & i) ^ (t & n) ^ (i & n);
              return 0 > f && (f += 4294967296), f;
            }
            function g(t, e, i, r, n, f) {
              var a = (e & r) ^ (e & f) ^ (r & f);
              return 0 > a && (a += 4294967296), a;
            }
            function M(t, e) {
              var i = B(t, e, 28),
                r = B(e, t, 2),
                n = B(e, t, 7),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            function w(t, e) {
              var i = N(t, e, 28),
                r = N(e, t, 2),
                n = N(e, t, 7),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            function _(t, e) {
              var i = B(t, e, 14),
                r = B(t, e, 18),
                n = B(e, t, 9),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            function S(t, e) {
              var i = N(t, e, 14),
                r = N(t, e, 18),
                n = N(e, t, 9),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            function A(t, e) {
              var i = B(t, e, 1),
                r = B(t, e, 8),
                n = j(t, e, 7),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            function x(t, e) {
              var i = N(t, e, 1),
                r = N(t, e, 8),
                n = X(t, e, 7),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            function R(t, e) {
              var i = B(t, e, 19),
                r = B(e, t, 29),
                n = j(t, e, 6),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            function I(t, e) {
              var i = N(t, e, 19),
                r = N(e, t, 29),
                n = X(t, e, 6),
                f = i ^ r ^ n;
              return 0 > f && (f += 4294967296), f;
            }
            var E = t("../hash"),
              k = E.utils,
              H = k.assert,
              z = k.rotr32,
              q = k.rotl32,
              P = k.sum32,
              O = k.sum32_4,
              C = k.sum32_5,
              B = k.rotr64_hi,
              N = k.rotr64_lo,
              j = k.shr64_hi,
              X = k.shr64_lo,
              T = k.sum64,
              L = k.sum64_hi,
              F = k.sum64_lo,
              K = k.sum64_4_hi,
              Z = k.sum64_4_lo,
              U = k.sum64_5_hi,
              J = k.sum64_5_lo,
              D = E.common.BlockHash,
              W = [
                1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278,
                1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122,
                1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205,
                773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771,
                3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063,
                1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298,
              ],
              V = [
                1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548, 961987163, 4081628472, 1508970993,
                3053834265, 2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764,
                1426881987, 3590304994, 1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868, 3835390401,
                2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901, 1249150122, 1856431235,
                1555081692, 3175218132, 1996064986, 2198950837, 2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671,
                3203337956, 3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964,
                773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823, 1695183700, 2343527390, 1986661051, 1014477480, 2177026350,
                1206759142, 2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008,
                3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720, 430227734, 3100823752, 506948616,
                1363258195, 659060556, 3750685593, 883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995,
                1747873779, 3602036899, 1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044, 2428436474,
                593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427, 3391569614, 3928383900, 3515267271, 566280711,
                3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269,
                320620315, 685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676, 1288033470, 3409855158,
                1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591,
              ],
              G = [1518500249, 1859775393, 2400959708, 3395469782];
            k.inherits(r, D),
              (i.sha256 = r),
              (r.blockSize = 512),
              (r.outSize = 256),
              (r.hmacStrength = 192),
              (r.padLength = 64),
              (r.prototype._update = function (t, e) {
                for (var i = this.W, r = 0; 16 > r; r++) i[r] = t[e + r];
                for (; i.length > r; r++) i[r] = O(b(i[r - 2]), i[r - 7], l(i[r - 15]), i[r - 16]);
                var n = this.h[0],
                  f = this.h[1],
                  a = this.h[2],
                  h = this.h[3],
                  d = this.h[4],
                  p = this.h[5],
                  m = this.h[6],
                  v = this.h[7];
                H(this.k.length === i.length);
                for (var r = 0; i.length > r; r++) {
                  var y = C(v, c(d), s(d, p, m), this.k[r], i[r]),
                    g = P(u(n), o(n, f, a));
                  (v = m), (m = p), (p = d), (d = P(h, y)), (h = a), (a = f), (f = n), (n = P(y, g));
                }
                (this.h[0] = P(this.h[0], n)),
                  (this.h[1] = P(this.h[1], f)),
                  (this.h[2] = P(this.h[2], a)),
                  (this.h[3] = P(this.h[3], h)),
                  (this.h[4] = P(this.h[4], d)),
                  (this.h[5] = P(this.h[5], p)),
                  (this.h[6] = P(this.h[6], m)),
                  (this.h[7] = P(this.h[7], v));
              }),
              (r.prototype._digest = function (t) {
                return "hex" === t ? k.toHex32(this.h, "big") : k.split32(this.h, "big");
              }),
              k.inherits(n, r),
              (i.sha224 = n),
              (n.blockSize = 512),
              (n.outSize = 224),
              (n.hmacStrength = 192),
              (n.padLength = 64),
              (n.prototype._digest = function (t) {
                return "hex" === t ? k.toHex32(this.h.slice(0, 7), "big") : k.split32(this.h.slice(0, 7), "big");
              }),
              k.inherits(f, D),
              (i.sha512 = f),
              (f.blockSize = 1024),
              (f.outSize = 512),
              (f.hmacStrength = 192),
              (f.padLength = 128),
              (f.prototype._prepareBlock = function (t, e) {
                for (var i = this.W, r = 0; 32 > r; r++) i[r] = t[e + r];
                for (; i.length > r; r += 2) {
                  var n = R(i[r - 4], i[r - 3]),
                    f = I(i[r - 4], i[r - 3]),
                    a = i[r - 14],
                    h = i[r - 13],
                    s = A(i[r - 30], i[r - 29]),
                    o = x(i[r - 30], i[r - 29]),
                    d = i[r - 32],
                    u = i[r - 31];
                  (i[r] = K(n, f, a, h, s, o, d, u)), (i[r + 1] = Z(n, f, a, h, s, o, d, u));
                }
              }),
              (f.prototype._update = function (t, e) {
                this._prepareBlock(t, e);
                var i = this.W,
                  r = this.h[0],
                  n = this.h[1],
                  f = this.h[2],
                  a = this.h[3],
                  h = this.h[4],
                  s = this.h[5],
                  o = this.h[6],
                  d = this.h[7],
                  u = this.h[8],
                  c = this.h[9],
                  l = this.h[10],
                  b = this.h[11],
                  p = this.h[12],
                  A = this.h[13],
                  x = this.h[14],
                  R = this.h[15];
                H(this.k.length === i.length);
                for (var I = 0; i.length > I; I += 2) {
                  var E = x,
                    k = R,
                    z = _(u, c),
                    q = S(u, c),
                    P = m(u, c, l, b, p, A),
                    O = v(u, c, l, b, p, A),
                    C = this.k[I],
                    B = this.k[I + 1],
                    N = i[I],
                    j = i[I + 1],
                    X = U(E, k, z, q, P, O, C, B, N, j),
                    K = J(E, k, z, q, P, O, C, B, N, j),
                    E = M(r, n),
                    k = w(r, n),
                    z = y(r, n, f, a, h, s),
                    q = g(r, n, f, a, h, s),
                    Z = L(E, k, z, q),
                    D = F(E, k, z, q);
                  (x = p),
                    (R = A),
                    (p = l),
                    (A = b),
                    (l = u),
                    (b = c),
                    (u = L(o, d, X, K)),
                    (c = F(d, d, X, K)),
                    (o = h),
                    (d = s),
                    (h = f),
                    (s = a),
                    (f = r),
                    (a = n),
                    (r = L(X, K, Z, D)),
                    (n = F(X, K, Z, D));
                }
                T(this.h, 0, r, n),
                  T(this.h, 2, f, a),
                  T(this.h, 4, h, s),
                  T(this.h, 6, o, d),
                  T(this.h, 8, u, c),
                  T(this.h, 10, l, b),
                  T(this.h, 12, p, A),
                  T(this.h, 14, x, R);
              }),
              (f.prototype._digest = function (t) {
                return "hex" === t ? k.toHex32(this.h, "big") : k.split32(this.h, "big");
              }),
              k.inherits(a, f),
              (i.sha384 = a),
              (a.blockSize = 1024),
              (a.outSize = 384),
              (a.hmacStrength = 192),
              (a.padLength = 128),
              (a.prototype._digest = function (t) {
                return "hex" === t ? k.toHex32(this.h.slice(0, 12), "big") : k.split32(this.h.slice(0, 12), "big");
              }),
              k.inherits(h, D),
              (i.sha1 = h),
              (h.blockSize = 512),
              (h.outSize = 160),
              (h.hmacStrength = 80),
              (h.padLength = 64),
              (h.prototype._update = function (t, e) {
                for (var i = this.W, r = 0; 16 > r; r++) i[r] = t[e + r];
                for (; i.length > r; r++) i[r] = q(i[r - 3] ^ i[r - 8] ^ i[r - 14] ^ i[r - 16], 1);
                for (var n = this.h[0], f = this.h[1], a = this.h[2], h = this.h[3], s = this.h[4], r = 0; i.length > r; r++) {
                  var o = ~~(r / 20),
                    d = C(q(n, 5), p(o, f, a, h), s, i[r], G[o]);
                  (s = h), (h = a), (a = q(f, 30)), (f = n), (n = d);
                }
                (this.h[0] = P(this.h[0], n)),
                  (this.h[1] = P(this.h[1], f)),
                  (this.h[2] = P(this.h[2], a)),
                  (this.h[3] = P(this.h[3], h)),
                  (this.h[4] = P(this.h[4], s));
              }),
              (h.prototype._digest = function (t) {
                return "hex" === t ? k.toHex32(this.h, "big") : k.split32(this.h, "big");
              });
          },
          { "../hash": 19 },
        ],
        24: [
          function (t, e, i) {
            function r(t, e) {
              if (Array.isArray(t)) return t.slice();
              if (!t) return [];
              var i = [];
              if ("string" == typeof t)
                if (e) {
                  if ("hex" === e) {
                    (t = t.replace(/[^a-z0-9]+/gi, "")), 0 !== t.length % 2 && (t = "0" + t);
                    for (var r = 0; t.length > r; r += 2) i.push(parseInt(t[r] + t[r + 1], 16));
                  }
                } else
                  for (var r = 0; t.length > r; r++) {
                    var n = t.charCodeAt(r),
                      f = n >> 8,
                      a = 255 & n;
                    f ? i.push(f, a) : i.push(a);
                  }
              else for (var r = 0; t.length > r; r++) i[r] = 0 | t[r];
              return i;
            }
            function n(t) {
              for (var e = "", i = 0; t.length > i; i++) e += h(t[i].toString(16));
              return e;
            }
            function f(t) {
              var e = (t >>> 24) | (65280 & (t >>> 8)) | (16711680 & (t << 8)) | ((255 & t) << 24);
              return e >>> 0;
            }
            function a(t, e) {
              for (var i = "", r = 0; t.length > r; r++) {
                var n = t[r];
                "little" === e && (n = f(n)), (i += s(n.toString(16)));
              }
              return i;
            }
            function h(t) {
              return 1 === t.length ? "0" + t : t;
            }
            function s(t) {
              return 7 === t.length
                ? "0" + t
                : 6 === t.length
                ? "00" + t
                : 5 === t.length
                ? "000" + t
                : 4 === t.length
                ? "0000" + t
                : 3 === t.length
                ? "00000" + t
                : 2 === t.length
                ? "000000" + t
                : 1 === t.length
                ? "0000000" + t
                : t;
            }
            function o(t, e, i, r) {
              var n = i - e;
              v(0 === n % 4);
              for (var f = Array(n / 4), a = 0, h = e; f.length > a; a++, h += 4) {
                var s;
                (s =
                  "big" === r
                    ? (t[h] << 24) | (t[h + 1] << 16) | (t[h + 2] << 8) | t[h + 3]
                    : (t[h + 3] << 24) | (t[h + 2] << 16) | (t[h + 1] << 8) | t[h]),
                  (f[a] = s >>> 0);
              }
              return f;
            }
            function d(t, e) {
              for (var i = Array(4 * t.length), r = 0, n = 0; t.length > r; r++, n += 4) {
                var f = t[r];
                "big" === e
                  ? ((i[n] = f >>> 24), (i[n + 1] = 255 & (f >>> 16)), (i[n + 2] = 255 & (f >>> 8)), (i[n + 3] = 255 & f))
                  : ((i[n + 3] = f >>> 24), (i[n + 2] = 255 & (f >>> 16)), (i[n + 1] = 255 & (f >>> 8)), (i[n] = 255 & f));
              }
              return i;
            }
            function u(t, e) {
              return (t >>> e) | (t << (32 - e));
            }
            function c(t, e) {
              return (t << e) | (t >>> (32 - e));
            }
            function l(t, e) {
              return (t + e) >>> 0;
            }
            function b(t, e, i) {
              return (t + e + i) >>> 0;
            }
            function p(t, e, i, r) {
              return (t + e + i + r) >>> 0;
            }
            function m(t, e, i, r, n) {
              return (t + e + i + r + n) >>> 0;
            }
            function v(t, e) {
              if (!t) throw Error(e || "Assertion failed");
            }
            function y(t, e, i, r) {
              var n = t[e],
                f = t[e + 1],
                a = (r + f) >>> 0,
                h = (r > a ? 1 : 0) + i + n;
              (t[e] = h >>> 0), (t[e + 1] = a);
            }
            function g(t, e, i, r) {
              var n = (e + r) >>> 0,
                f = (e > n ? 1 : 0) + t + i;
              return f >>> 0;
            }
            function M(t, e, i, r) {
              var n = e + r;
              return n >>> 0;
            }
            function w(t, e, i, r, n, f, a, h) {
              var s = 0,
                o = e;
              (o = (o + r) >>> 0), (s += e > o ? 1 : 0), (o = (o + f) >>> 0), (s += f > o ? 1 : 0), (o = (o + h) >>> 0), (s += h > o ? 1 : 0);
              var d = t + i + n + a + s;
              return d >>> 0;
            }
            function _(t, e, i, r, n, f, a, h) {
              var s = e + r + f + h;
              return s >>> 0;
            }
            function S(t, e, i, r, n, f, a, h, s, o) {
              var d = 0,
                u = e;
              (u = (u + r) >>> 0),
                (d += e > u ? 1 : 0),
                (u = (u + f) >>> 0),
                (d += f > u ? 1 : 0),
                (u = (u + h) >>> 0),
                (d += h > u ? 1 : 0),
                (u = (u + o) >>> 0),
                (d += o > u ? 1 : 0);
              var c = t + i + n + a + s + d;
              return c >>> 0;
            }
            function A(t, e, i, r, n, f, a, h, s, o) {
              var d = e + r + f + h + o;
              return d >>> 0;
            }
            function x(t, e, i) {
              var r = (e << (32 - i)) | (t >>> i);
              return r >>> 0;
            }
            function R(t, e, i) {
              var r = (t << (32 - i)) | (e >>> i);
              return r >>> 0;
            }
            function I(t, e, i) {
              return t >>> i;
            }
            function E(t, e, i) {
              var r = (t << (32 - i)) | (e >>> i);
              return r >>> 0;
            }
            var k = i,
              H = t("inherits");
            (k.toArray = r),
              (k.toHex = n),
              (k.htonl = f),
              (k.toHex32 = a),
              (k.zero2 = h),
              (k.zero8 = s),
              (k.join32 = o),
              (k.split32 = d),
              (k.rotr32 = u),
              (k.rotl32 = c),
              (k.sum32 = l),
              (k.sum32_3 = b),
              (k.sum32_4 = p),
              (k.sum32_5 = m),
              (k.assert = v),
              (k.inherits = H),
              (i.sum64 = y),
              (i.sum64_hi = g),
              (i.sum64_lo = M),
              (i.sum64_4_hi = w),
              (i.sum64_4_lo = _),
              (i.sum64_5_hi = S),
              (i.sum64_5_lo = A),
              (i.rotr64_hi = x),
              (i.rotr64_lo = R),
              (i.shr64_hi = I),
              (i.shr64_lo = E);
          },
          { inherits: 27 },
        ],
        25: [
          function (t, e) {
            "use strict";
            function i(t) {
              if (!(this instanceof i)) return new i(t);
              (this.hash = t.hash),
                (this.predResist = !!t.predResist),
                (this.outLen = this.hash.outSize),
                (this.minEntropy = t.minEntropy || this.hash.hmacStrength),
                (this.reseed = null),
                (this.reseedInterval = null),
                (this.K = null),
                (this.V = null);
              var e = n.toArray(t.entropy, t.entropyEnc || "hex"),
                r = n.toArray(t.nonce, t.nonceEnc || "hex"),
                a = n.toArray(t.pers, t.persEnc || "hex");
              f(e.length >= this.minEntropy / 8, "Not enough entropy. Minimum is: " + this.minEntropy + " bits"), this._init(e, r, a);
            }
            var r = t("hash.js"),
              n = t("minimalistic-crypto-utils"),
              f = t("minimalistic-assert");
            (e.exports = i),
              (i.prototype._init = function (t, e, i) {
                var r = t.concat(e).concat(i);
                (this.K = Array(this.outLen / 8)), (this.V = Array(this.outLen / 8));
                for (var n = 0; this.V.length > n; n++) (this.K[n] = 0), (this.V[n] = 1);
                this._update(r), (this.reseed = 1), (this.reseedInterval = 281474976710656);
              }),
              (i.prototype._hmac = function () {
                return new r.hmac(this.hash, this.K);
              }),
              (i.prototype._update = function (t) {
                var e = this._hmac().update(this.V).update([0]);
                t && (e = e.update(t)),
                  (this.K = e.digest()),
                  (this.V = this._hmac().update(this.V).digest()),
                  t && ((this.K = this._hmac().update(this.V).update([1]).update(t).digest()), (this.V = this._hmac().update(this.V).digest()));
              }),
              (i.prototype.reseed = function (t, e, i, r) {
                "string" != typeof e && ((r = i), (i = e), (e = null)),
                  (t = n.toArray(t, e)),
                  (i = n.toArray(i, r)),
                  f(t.length >= this.minEntropy / 8, "Not enough entropy. Minimum is: " + this.minEntropy + " bits"),
                  this._update(t.concat(i || [])),
                  (this.reseed = 1);
              }),
              (i.prototype.generate = function (t, e, i, r) {
                if (this.reseed > this.reseedInterval) throw Error("Reseed is required");
                "string" != typeof e && ((r = i), (i = e), (e = null)), i && ((i = n.toArray(i, r || "hex")), this._update(i));
                for (var f = []; t > f.length; ) (this.V = this._hmac().update(this.V).digest()), (f = f.concat(this.V));
                var a = f.slice(0, t);
                return this._update(i), this.reseed++, n.encode(a, e);
              });
          },
          { "hash.js": 19, "minimalistic-assert": 28, "minimalistic-crypto-utils": 26 },
        ],
        26: [
          function (t, e, i) {
            "use strict";
            function r(t, e) {
              if (Array.isArray(t)) return t.slice();
              if (!t) return [];
              var i = [];
              if ("string" != typeof t) {
                for (var r = 0; t.length > r; r++) i[r] = 0 | t[r];
                return i;
              }
              if ("hex" === e) {
                (t = t.replace(/[^a-z0-9]+/gi, "")), 0 !== t.length % 2 && (t = "0" + t);
                for (var r = 0; t.length > r; r += 2) i.push(parseInt(t[r] + t[r + 1], 16));
              } else
                for (var r = 0; t.length > r; r++) {
                  var n = t.charCodeAt(r),
                    f = n >> 8,
                    a = 255 & n;
                  f ? i.push(f, a) : i.push(a);
                }
              return i;
            }
            function n(t) {
              return 1 === t.length ? "0" + t : t;
            }
            function f(t) {
              for (var e = "", i = 0; t.length > i; i++) e += n(t[i].toString(16));
              return e;
            }
            var a = i;
            (a.toArray = r),
              (a.zero2 = n),
              (a.toHex = f),
              (a.encode = function (t, e) {
                return "hex" === e ? f(t) : t;
              });
          },
          {},
        ],
        27: [
          function (t, e) {
            e.exports =
              "function" == typeof Object.create
                ? function (t, e) {
                    (t.super_ = e),
                      (t.prototype = Object.create(e.prototype, { constructor: { value: t, enumerable: !1, writable: !0, configurable: !0 } }));
                  }
                : function (t, e) {
                    t.super_ = e;
                    var i = function () {};
                    (i.prototype = e.prototype), (t.prototype = new i()), (t.prototype.constructor = t);
                  };
          },
          {},
        ],
        28: [
          function (t, e) {
            function i(t, e) {
              if (!t) throw Error(e || "Assertion failed");
            }
            (e.exports = i),
              (i.equal = function (t, e, i) {
                if (t != e) throw Error(i || "Assertion failed: " + t + " != " + e);
              });
          },
          {},
        ],
        29: [
          function (t, e, i) {
            "use strict";
            function r(t, e) {
              if (Array.isArray(t)) return t.slice();
              if (!t) return [];
              var i = [];
              if ("string" != typeof t) {
                for (var r = 0; t.length > r; r++) i[r] = 0 | t[r];
                return i;
              }
              if (e) {
                if ("hex" === e) {
                  (t = t.replace(/[^a-z0-9]+/gi, "")), 0 !== t.length % 2 && (t = "0" + t);
                  for (var r = 0; t.length > r; r += 2) i.push(parseInt(t[r] + t[r + 1], 16));
                }
              } else
                for (var r = 0; t.length > r; r++) {
                  var n = t.charCodeAt(r),
                    f = n >> 8,
                    a = 255 & n;
                  f ? i.push(f, a) : i.push(a);
                }
              return i;
            }
            function n(t) {
              return 1 === t.length ? "0" + t : t;
            }
            function f(t) {
              for (var e = "", i = 0; t.length > i; i++) e += n(t[i].toString(16));
              return e;
            }
            var a = i;
            (a.toArray = r),
              (a.zero2 = n),
              (a.toHex = f),
              (a.encode = function (t, e) {
                return "hex" === e ? f(t) : t;
              });
          },
          {},
        ],
        30: [
          function (t, e) {
            e.exports = {
              name: "elliptic",
              version: "6.4.1",
              description: "EC cryptography",
              main: "lib/elliptic.js",
              files: ["lib"],
              scripts: {
                jscs: "jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",
                jshint: "jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",
                lint: "npm run jscs && npm run jshint",
                unit: "istanbul test _mocha --reporter=spec test/index.js",
                test: "npm run lint && npm run unit",
                version: "grunt dist && git add dist/",
              },
              repository: { type: "git", url: "git@github.com:indutny/elliptic" },
              keywords: ["EC", "Elliptic", "curve", "Cryptography"],
              author: "Fedor Indutny <fedor@indutny.com>",
              license: "MIT",
              bugs: { url: "https://github.com/indutny/elliptic/issues" },
              homepage: "https://github.com/indutny/elliptic",
              devDependencies: {
                brfs: "^1.4.3",
                coveralls: "^2.11.3",
                grunt: "^0.4.5",
                "grunt-browserify": "^5.0.0",
                "grunt-cli": "^1.2.0",
                "grunt-contrib-connect": "^1.0.0",
                "grunt-contrib-copy": "^1.0.0",
                "grunt-contrib-uglify": "^1.0.1",
                "grunt-mocha-istanbul": "^3.0.1",
                "grunt-saucelabs": "^8.6.2",
                istanbul: "^0.4.2",
                jscs: "^2.9.0",
                jshint: "^2.6.0",
                mocha: "^2.1.0",
              },
              dependencies: {
                "bn.js": "^4.4.0",
                brorand: "^1.0.1",
                "hash.js": "^1.0.0",
                "hmac-drbg": "^1.0.0",
                inherits: "^2.0.1",
                "minimalistic-assert": "^1.0.0",
                "minimalistic-crypto-utils": "^1.0.0",
              },
            };
          },
          {},
        ],
      },
      {},
      [1]
    )(1);
  }),
  (function (t, e) {
    "use strict";
    function i(t, e) {
      if (!t) throw Error(e || "Assertion failed");
    }
    function r(t, e) {
      t.super_ = e;
      var i = function () {};
      (i.prototype = e.prototype), (t.prototype = new i()), (t.prototype.constructor = t);
    }
    function n(t, e, i) {
      return n.isBN(t)
        ? t
        : ((this.negative = 0),
          (this.words = null),
          (this.length = 0),
          (this.red = null),
          null !== t && (("le" === e || "be" === e) && ((i = e), (e = 10)), this._init(t || 0, e || 10, i || "be")),
          void 0);
    }
    function f(t, e, r) {
      for (var n = 0, f = Math.min(t.length, r), a = 0, h = e; f > h; h++) {
        var s = t.charCodeAt(h) - 48;
        n <<= 4;
        var o;
        (o = s >= 49 && 54 >= s ? s - 49 + 10 : s >= 17 && 22 >= s ? s - 17 + 10 : s), (n |= o), (a |= o);
      }
      return i(!(240 & a), "Invalid character in " + t), n;
    }
    function a(t, e, r, n) {
      for (var f = 0, a = 0, h = Math.min(t.length, r), s = e; h > s; s++) {
        var o = t.charCodeAt(s) - 48;
        (f *= n), (a = o >= 49 ? o - 49 + 10 : o >= 17 ? o - 17 + 10 : o), i(o >= 0 && n > a, "Invalid character"), (f += a);
      }
      return f;
    }
    function h(t) {
      for (var e = Array(t.bitLength()), i = 0; e.length > i; i++) {
        var r = 0 | (i / 26),
          n = i % 26;
        e[i] = (t.words[r] & (1 << n)) >>> n;
      }
      return e;
    }
    function s(t, e, i) {
      i.negative = e.negative ^ t.negative;
      var r = 0 | (t.length + e.length);
      (i.length = r), (r = 0 | (r - 1));
      var n = 0 | t.words[0],
        f = 0 | e.words[0],
        a = n * f,
        h = 67108863 & a,
        s = 0 | (a / 67108864);
      i.words[0] = h;
      for (var o = 1; r > o; o++) {
        for (var d = s >>> 26, u = 67108863 & s, c = Math.min(o, e.length - 1), l = Math.max(0, o - t.length + 1); c >= l; l++) {
          var b = 0 | (o - l);
          (n = 0 | t.words[b]), (f = 0 | e.words[l]), (a = n * f + u), (d += 0 | (a / 67108864)), (u = 67108863 & a);
        }
        (i.words[o] = 0 | u), (s = 0 | d);
      }
      return 0 !== s ? (i.words[o] = 0 | s) : i.length--, i._strip();
    }
    function o(t, e, i) {
      (i.negative = e.negative ^ t.negative), (i.length = t.length + e.length);
      for (var r = 0, n = 0, f = 0; i.length - 1 > f; f++) {
        var a = n;
        n = 0;
        for (var h = 67108863 & r, s = Math.min(f, e.length - 1), o = Math.max(0, f - t.length + 1); s >= o; o++) {
          var d = f - o,
            u = 0 | t.words[d],
            c = 0 | e.words[o],
            l = u * c,
            b = 67108863 & l;
          (a = 0 | (a + (0 | (l / 67108864)))), (b = 0 | (b + h)), (h = 67108863 & b), (a = 0 | (a + (b >>> 26))), (n += a >>> 26), (a &= 67108863);
        }
        (i.words[f] = h), (r = a), (a = n);
      }
      return 0 !== r ? (i.words[f] = r) : i.length--, i._strip();
    }
    function d(t, e, i) {
      var r = new u();
      return r.mulp(t, e, i);
    }
    function u(t, e) {
      (this.x = t), (this.y = e);
    }
    function c(t, e) {
      (this.name = t),
        (this.p = new n(e, 16)),
        (this.n = this.p.bitLength()),
        (this.k = new n(1).iushln(this.n).isub(this.p)),
        (this.tmp = this._tmp());
    }
    function l() {
      c.call(this, "k256", "ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f");
    }
    function b() {
      c.call(this, "p224", "ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001");
    }
    function p() {
      c.call(this, "p192", "ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff");
    }
    function m() {
      c.call(this, "25519", "7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed");
    }
    function v(t) {
      if ("string" == typeof t) {
        var e = n._prime(t);
        (this.m = e.p), (this.prime = e);
      } else i(t.gtn(1), "modulus must be greater than 1"), (this.m = t), (this.prime = null);
    }
    function y(t) {
      v.call(this, t),
        (this.shift = this.m.bitLength()),
        0 !== this.shift % 26 && (this.shift += 26 - (this.shift % 26)),
        (this.r = new n(1).iushln(this.shift)),
        (this.r2 = this.imod(this.r.sqr())),
        (this.rinv = this.r._invmp(this.m)),
        (this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)),
        (this.minv = this.minv.umod(this.r)),
        (this.minv = this.r.sub(this.minv));
    }
    "object" == typeof t ? (t.exports = n) : (e.BN = n), (n.BN = n), (n.wordSize = 26);
    var g;
    try {
      g = require("buffer").Buffer;
    } catch (M) {}
    (n.isBN = function (t) {
      return t instanceof n ? !0 : null !== t && "object" == typeof t && t.constructor.wordSize === n.wordSize && Array.isArray(t.words);
    }),
      (n.max = function (t, e) {
        return t.cmp(e) > 0 ? t : e;
      }),
      (n.min = function (t, e) {
        return 0 > t.cmp(e) ? t : e;
      }),
      (n.prototype._init = function (t, e, r) {
        if ("number" == typeof t) return this._initNumber(t, e, r);
        if ("object" == typeof t) return this._initArray(t, e, r);
        "hex" === e && (e = 16), i(e === (0 | e) && e >= 2 && 36 >= e), (t = ("" + t).replace(/\s+/g, ""));
        var n = 0;
        "-" === t[0] && n++,
          16 === e ? this._parseHex(t, n) : this._parseBase(t, e, n),
          "-" === t[0] && (this.negative = 1),
          this._strip(),
          "le" === r && this._initArray(this.toArray(), e, r);
      }),
      (n.prototype._initNumber = function (t, e, r) {
        0 > t && ((this.negative = 1), (t = -t)),
          67108864 > t
            ? ((this.words = [67108863 & t]), (this.length = 1))
            : 4503599627370496 > t
            ? ((this.words = [67108863 & t, 67108863 & (t / 67108864)]), (this.length = 2))
            : (i(9007199254740992 > t), (this.words = [67108863 & t, 67108863 & (t / 67108864), 1]), (this.length = 3)),
          "le" === r && this._initArray(this.toArray(), e, r);
      }),
      (n.prototype._initArray = function (t, e, r) {
        if ((i("number" == typeof t.length), 0 >= t.length)) return (this.words = [0]), (this.length = 1), this;
        (this.length = Math.ceil(t.length / 3)), (this.words = Array(this.length));
        for (var n = 0; this.length > n; n++) this.words[n] = 0;
        var f,
          a,
          h = 0;
        if ("be" === r)
          for (n = t.length - 1, f = 0; n >= 0; n -= 3)
            (a = t[n] | (t[n - 1] << 8) | (t[n - 2] << 16)),
              (this.words[f] |= 67108863 & (a << h)),
              (this.words[f + 1] = 67108863 & (a >>> (26 - h))),
              (h += 24),
              h >= 26 && ((h -= 26), f++);
        else if ("le" === r)
          for (n = 0, f = 0; t.length > n; n += 3)
            (a = t[n] | (t[n + 1] << 8) | (t[n + 2] << 16)),
              (this.words[f] |= 67108863 & (a << h)),
              (this.words[f + 1] = 67108863 & (a >>> (26 - h))),
              (h += 24),
              h >= 26 && ((h -= 26), f++);
        return this._strip();
      }),
      (n.prototype._parseHex = function (t, e) {
        (this.length = Math.ceil((t.length - e) / 6)), (this.words = Array(this.length));
        for (var i = 0; this.length > i; i++) this.words[i] = 0;
        var r,
          n,
          a = 0;
        for (i = t.length - 6, r = 0; i >= e; i -= 6)
          (n = f(t, i, i + 6)),
            (this.words[r] |= 67108863 & (n << a)),
            (this.words[r + 1] |= 4194303 & (n >>> (26 - a))),
            (a += 24),
            a >= 26 && ((a -= 26), r++);
        i + 6 !== e && ((n = f(t, e, i + 6)), (this.words[r] |= 67108863 & (n << a)), (this.words[r + 1] |= 4194303 & (n >>> (26 - a)))),
          this._strip();
      }),
      (n.prototype._parseBase = function (t, e, i) {
        (this.words = [0]), (this.length = 1);
        for (var r = 0, n = 1; 67108863 >= n; n *= e) r++;
        r--, (n = 0 | (n / e));
        for (var f = t.length - i, h = f % r, s = Math.min(f, f - h) + i, o = 0, d = i; s > d; d += r)
          (o = a(t, d, d + r, e)), this.imuln(n), 67108864 > this.words[0] + o ? (this.words[0] += o) : this._iaddn(o);
        if (0 !== h) {
          var u = 1;
          for (o = a(t, d, t.length, e), d = 0; h > d; d++) u *= e;
          this.imuln(u), 67108864 > this.words[0] + o ? (this.words[0] += o) : this._iaddn(o);
        }
      }),
      (n.prototype.copy = function (t) {
        t.words = Array(this.length);
        for (var e = 0; this.length > e; e++) t.words[e] = this.words[e];
        (t.length = this.length), (t.negative = this.negative), (t.red = this.red);
      }),
      (n.prototype._move = function (t) {
        (t.words = this.words), (t.length = this.length), (t.negative = this.negative), (t.red = this.red);
      }),
      (n.prototype.clone = function () {
        var t = new n(null);
        return this.copy(t), t;
      }),
      (n.prototype._expand = function (t) {
        for (; t > this.length; ) this.words[this.length++] = 0;
        return this;
      }),
      (n.prototype._strip = function () {
        for (; this.length > 1 && 0 === this.words[this.length - 1]; ) this.length--;
        return this._normSign();
      }),
      (n.prototype._normSign = function () {
        return 1 === this.length && 0 === this.words[0] && (this.negative = 0), this;
      }),
      (n.prototype.inspect = function () {
        return (this.red ? "<BN-R: " : "<BN: ") + this.toString(16) + ">";
      });
    var w = [
        "",
        "0",
        "00",
        "000",
        "0000",
        "00000",
        "000000",
        "0000000",
        "00000000",
        "000000000",
        "0000000000",
        "00000000000",
        "000000000000",
        "0000000000000",
        "00000000000000",
        "000000000000000",
        "0000000000000000",
        "00000000000000000",
        "000000000000000000",
        "0000000000000000000",
        "00000000000000000000",
        "000000000000000000000",
        "0000000000000000000000",
        "00000000000000000000000",
        "000000000000000000000000",
        "0000000000000000000000000",
      ],
      _ = [0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
      S = [
        0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216, 43046721, 1e7, 19487171, 35831808, 62748517, 7529536, 11390625,
        16777216, 24137569, 34012224, 47045881, 64e6, 4084101, 5153632, 6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 243e5,
        28629151, 33554432, 39135393, 45435424, 52521875, 60466176,
      ];
    (n.prototype.toString = function (t, e) {
      (t = t || 10), (e = 0 | e || 1);
      var r;
      if (16 === t || "hex" === t) {
        r = "";
        for (var n = 0, f = 0, a = 0; this.length > a; a++) {
          var h = this.words[a],
            s = (16777215 & ((h << n) | f)).toString(16);
          (f = 16777215 & (h >>> (24 - n))),
            (r = 0 !== f || a !== this.length - 1 ? w[6 - s.length] + s + r : s + r),
            (n += 2),
            n >= 26 && ((n -= 26), a--);
        }
        for (0 !== f && (r = f.toString(16) + r); 0 !== r.length % e; ) r = "0" + r;
        return 0 !== this.negative && (r = "-" + r), r;
      }
      if (t === (0 | t) && t >= 2 && 36 >= t) {
        var o = _[t],
          d = S[t];
        r = "";
        var u = this.clone();
        for (u.negative = 0; !u.isZero(); ) {
          var c = u.modrn(d).toString(t);
          (u = u.idivn(d)), (r = u.isZero() ? c + r : w[o - c.length] + c + r);
        }
        for (this.isZero() && (r = "0" + r); 0 !== r.length % e; ) r = "0" + r;
        return 0 !== this.negative && (r = "-" + r), r;
      }
      i(!1, "Base should be between 2 and 36");
    }),
      (n.prototype.toNumber = function () {
        var t = this.words[0];
        return (
          2 === this.length
            ? (t += 67108864 * this.words[1])
            : 3 === this.length && 1 === this.words[2]
            ? (t += 4503599627370496 + 67108864 * this.words[1])
            : this.length > 2 && i(!1, "Number can only safely store up to 53 bits"),
          0 !== this.negative ? -t : t
        );
      }),
      (n.prototype.toJSON = function () {
        return this.toString(16, 2);
      }),
      g &&
        (n.prototype.toBuffer = function (t, e) {
          return this.toArrayLike(g, t, e);
        }),
      (n.prototype.toArray = function (t, e) {
        return this.toArrayLike(Array, t, e);
      }),
      (n.prototype.toArrayLike = function (t, e, r) {
        var n = this.byteLength(),
          f = r || Math.max(1, n);
        i(f >= n, "byte array longer than desired length"), i(f > 0, "Requested array length <= 0"), this._strip();
        var a,
          h,
          s = "le" === e,
          o = A(t, f),
          d = this.clone();
        if (s) {
          for (h = 0; !d.isZero(); h++) (a = d.andln(255)), d.iushrn(8), (o[h] = a);
          for (; f > h; h++) o[h] = 0;
        } else {
          for (h = 0; f - n > h; h++) o[h] = 0;
          for (h = 0; !d.isZero(); h++) (a = d.andln(255)), d.iushrn(8), (o[f - h - 1] = a);
        }
        return o;
      });
    var A = function A(t, e) {
      return t.allocUnsafe ? t.allocUnsafe(e) : new t(e);
    };
    (n.prototype._countBits = Math.clz32
      ? function (t) {
          return 32 - Math.clz32(t);
        }
      : function (t) {
          var e = t,
            i = 0;
          return (
            e >= 4096 && ((i += 13), (e >>>= 13)),
            e >= 64 && ((i += 7), (e >>>= 7)),
            e >= 8 && ((i += 4), (e >>>= 4)),
            e >= 2 && ((i += 2), (e >>>= 2)),
            i + e
          );
        }),
      (n.prototype._zeroBits = function (t) {
        if (0 === t) return 26;
        var e = t,
          i = 0;
        return (
          0 === (8191 & e) && ((i += 13), (e >>>= 13)),
          0 === (127 & e) && ((i += 7), (e >>>= 7)),
          0 === (15 & e) && ((i += 4), (e >>>= 4)),
          0 === (3 & e) && ((i += 2), (e >>>= 2)),
          0 === (1 & e) && i++,
          i
        );
      }),
      (n.prototype.bitLength = function () {
        var t = this.words[this.length - 1],
          e = this._countBits(t);
        return 26 * (this.length - 1) + e;
      }),
      (n.prototype.zeroBits = function () {
        if (this.isZero()) return 0;
        for (var t = 0, e = 0; this.length > e; e++) {
          var i = this._zeroBits(this.words[e]);
          if (((t += i), 26 !== i)) break;
        }
        return t;
      }),
      (n.prototype.byteLength = function () {
        return Math.ceil(this.bitLength() / 8);
      }),
      (n.prototype.toTwos = function (t) {
        return 0 !== this.negative ? this.abs().inotn(t).iaddn(1) : this.clone();
      }),
      (n.prototype.fromTwos = function (t) {
        return this.testn(t - 1) ? this.notn(t).iaddn(1).ineg() : this.clone();
      }),
      (n.prototype.isNeg = function () {
        return 0 !== this.negative;
      }),
      (n.prototype.neg = function () {
        return this.clone().ineg();
      }),
      (n.prototype.ineg = function () {
        return this.isZero() || (this.negative ^= 1), this;
      }),
      (n.prototype.iuor = function (t) {
        for (; this.length < t.length; ) this.words[this.length++] = 0;
        for (var e = 0; t.length > e; e++) this.words[e] = this.words[e] | t.words[e];
        return this._strip();
      }),
      (n.prototype.ior = function (t) {
        return i(0 === (this.negative | t.negative)), this.iuor(t);
      }),
      (n.prototype.or = function (t) {
        return this.length > t.length ? this.clone().ior(t) : t.clone().ior(this);
      }),
      (n.prototype.uor = function (t) {
        return this.length > t.length ? this.clone().iuor(t) : t.clone().iuor(this);
      }),
      (n.prototype.iuand = function (t) {
        var e;
        e = this.length > t.length ? t : this;
        for (var i = 0; e.length > i; i++) this.words[i] = this.words[i] & t.words[i];
        return (this.length = e.length), this._strip();
      }),
      (n.prototype.iand = function (t) {
        return i(0 === (this.negative | t.negative)), this.iuand(t);
      }),
      (n.prototype.and = function (t) {
        return this.length > t.length ? this.clone().iand(t) : t.clone().iand(this);
      }),
      (n.prototype.uand = function (t) {
        return this.length > t.length ? this.clone().iuand(t) : t.clone().iuand(this);
      }),
      (n.prototype.iuxor = function (t) {
        var e, i;
        this.length > t.length ? ((e = this), (i = t)) : ((e = t), (i = this));
        for (var r = 0; i.length > r; r++) this.words[r] = e.words[r] ^ i.words[r];
        if (this !== e) for (; e.length > r; r++) this.words[r] = e.words[r];
        return (this.length = e.length), this._strip();
      }),
      (n.prototype.ixor = function (t) {
        return i(0 === (this.negative | t.negative)), this.iuxor(t);
      }),
      (n.prototype.xor = function (t) {
        return this.length > t.length ? this.clone().ixor(t) : t.clone().ixor(this);
      }),
      (n.prototype.uxor = function (t) {
        return this.length > t.length ? this.clone().iuxor(t) : t.clone().iuxor(this);
      }),
      (n.prototype.inotn = function (t) {
        i("number" == typeof t && t >= 0);
        var e = 0 | Math.ceil(t / 26),
          r = t % 26;
        this._expand(e), r > 0 && e--;
        for (var n = 0; e > n; n++) this.words[n] = 67108863 & ~this.words[n];
        return r > 0 && (this.words[n] = ~this.words[n] & (67108863 >> (26 - r))), this._strip();
      }),
      (n.prototype.notn = function (t) {
        return this.clone().inotn(t);
      }),
      (n.prototype.setn = function (t, e) {
        i("number" == typeof t && t >= 0);
        var r = 0 | (t / 26),
          n = t % 26;
        return this._expand(r + 1), (this.words[r] = e ? this.words[r] | (1 << n) : this.words[r] & ~(1 << n)), this._strip();
      }),
      (n.prototype.iadd = function (t) {
        var e;
        if (0 !== this.negative && 0 === t.negative) return (this.negative = 0), (e = this.isub(t)), (this.negative ^= 1), this._normSign();
        if (0 === this.negative && 0 !== t.negative) return (t.negative = 0), (e = this.isub(t)), (t.negative = 1), e._normSign();
        var i, r;
        this.length > t.length ? ((i = this), (r = t)) : ((i = t), (r = this));
        for (var n = 0, f = 0; r.length > f; f++) (e = (0 | i.words[f]) + (0 | r.words[f]) + n), (this.words[f] = 67108863 & e), (n = e >>> 26);
        for (; 0 !== n && i.length > f; f++) (e = (0 | i.words[f]) + n), (this.words[f] = 67108863 & e), (n = e >>> 26);
        if (((this.length = i.length), 0 !== n)) (this.words[this.length] = n), this.length++;
        else if (i !== this) for (; i.length > f; f++) this.words[f] = i.words[f];
        return this;
      }),
      (n.prototype.add = function (t) {
        var e;
        return 0 !== t.negative && 0 === this.negative
          ? ((t.negative = 0), (e = this.sub(t)), (t.negative ^= 1), e)
          : 0 === t.negative && 0 !== this.negative
          ? ((this.negative = 0), (e = t.sub(this)), (this.negative = 1), e)
          : this.length > t.length
          ? this.clone().iadd(t)
          : t.clone().iadd(this);
      }),
      (n.prototype.isub = function (t) {
        if (0 !== t.negative) {
          t.negative = 0;
          var e = this.iadd(t);
          return (t.negative = 1), e._normSign();
        }
        if (0 !== this.negative) return (this.negative = 0), this.iadd(t), (this.negative = 1), this._normSign();
        var i = this.cmp(t);
        if (0 === i) return (this.negative = 0), (this.length = 1), (this.words[0] = 0), this;
        var r, n;
        i > 0 ? ((r = this), (n = t)) : ((r = t), (n = this));
        for (var f = 0, a = 0; n.length > a; a++) (e = (0 | r.words[a]) - (0 | n.words[a]) + f), (f = e >> 26), (this.words[a] = 67108863 & e);
        for (; 0 !== f && r.length > a; a++) (e = (0 | r.words[a]) + f), (f = e >> 26), (this.words[a] = 67108863 & e);
        if (0 === f && r.length > a && r !== this) for (; r.length > a; a++) this.words[a] = r.words[a];
        return (this.length = Math.max(this.length, a)), r !== this && (this.negative = 1), this._strip();
      }),
      (n.prototype.sub = function (t) {
        return this.clone().isub(t);
      });
    var x = function x(t, e, i) {
      var r,
        n,
        f,
        a = t.words,
        h = e.words,
        s = i.words,
        o = 0,
        d = 0 | a[0],
        u = 8191 & d,
        c = d >>> 13,
        l = 0 | a[1],
        b = 8191 & l,
        p = l >>> 13,
        m = 0 | a[2],
        v = 8191 & m,
        y = m >>> 13,
        g = 0 | a[3],
        M = 8191 & g,
        w = g >>> 13,
        _ = 0 | a[4],
        S = 8191 & _,
        A = _ >>> 13,
        x = 0 | a[5],
        R = 8191 & x,
        I = x >>> 13,
        E = 0 | a[6],
        k = 8191 & E,
        H = E >>> 13,
        z = 0 | a[7],
        q = 8191 & z,
        P = z >>> 13,
        O = 0 | a[8],
        C = 8191 & O,
        B = O >>> 13,
        N = 0 | a[9],
        j = 8191 & N,
        X = N >>> 13,
        T = 0 | h[0],
        L = 8191 & T,
        F = T >>> 13,
        K = 0 | h[1],
        Z = 8191 & K,
        U = K >>> 13,
        J = 0 | h[2],
        D = 8191 & J,
        W = J >>> 13,
        V = 0 | h[3],
        G = 8191 & V,
        Y = V >>> 13,
        Q = 0 | h[4],
        $ = 8191 & Q,
        te = Q >>> 13,
        ee = 0 | h[5],
        ie = 8191 & ee,
        re = ee >>> 13,
        ne = 0 | h[6],
        fe = 8191 & ne,
        ae = ne >>> 13,
        he = 0 | h[7],
        se = 8191 & he,
        oe = he >>> 13,
        de = 0 | h[8],
        ue = 8191 & de,
        ce = de >>> 13,
        le = 0 | h[9],
        be = 8191 & le,
        pe = le >>> 13;
      (i.negative = t.negative ^ e.negative),
        (i.length = 19),
        (r = Math.imul(u, L)),
        (n = Math.imul(u, F)),
        (n = 0 | (n + Math.imul(c, L))),
        (f = Math.imul(c, F));
      var me = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (me >>> 26))),
        (me &= 67108863),
        (r = Math.imul(b, L)),
        (n = Math.imul(b, F)),
        (n = 0 | (n + Math.imul(p, L))),
        (f = Math.imul(p, F)),
        (r = 0 | (r + Math.imul(u, Z))),
        (n = 0 | (n + Math.imul(u, U))),
        (n = 0 | (n + Math.imul(c, Z))),
        (f = 0 | (f + Math.imul(c, U)));
      var ve = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (ve >>> 26))),
        (ve &= 67108863),
        (r = Math.imul(v, L)),
        (n = Math.imul(v, F)),
        (n = 0 | (n + Math.imul(y, L))),
        (f = Math.imul(y, F)),
        (r = 0 | (r + Math.imul(b, Z))),
        (n = 0 | (n + Math.imul(b, U))),
        (n = 0 | (n + Math.imul(p, Z))),
        (f = 0 | (f + Math.imul(p, U))),
        (r = 0 | (r + Math.imul(u, D))),
        (n = 0 | (n + Math.imul(u, W))),
        (n = 0 | (n + Math.imul(c, D))),
        (f = 0 | (f + Math.imul(c, W)));
      var ye = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (ye >>> 26))),
        (ye &= 67108863),
        (r = Math.imul(M, L)),
        (n = Math.imul(M, F)),
        (n = 0 | (n + Math.imul(w, L))),
        (f = Math.imul(w, F)),
        (r = 0 | (r + Math.imul(v, Z))),
        (n = 0 | (n + Math.imul(v, U))),
        (n = 0 | (n + Math.imul(y, Z))),
        (f = 0 | (f + Math.imul(y, U))),
        (r = 0 | (r + Math.imul(b, D))),
        (n = 0 | (n + Math.imul(b, W))),
        (n = 0 | (n + Math.imul(p, D))),
        (f = 0 | (f + Math.imul(p, W))),
        (r = 0 | (r + Math.imul(u, G))),
        (n = 0 | (n + Math.imul(u, Y))),
        (n = 0 | (n + Math.imul(c, G))),
        (f = 0 | (f + Math.imul(c, Y)));
      var ge = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (ge >>> 26))),
        (ge &= 67108863),
        (r = Math.imul(S, L)),
        (n = Math.imul(S, F)),
        (n = 0 | (n + Math.imul(A, L))),
        (f = Math.imul(A, F)),
        (r = 0 | (r + Math.imul(M, Z))),
        (n = 0 | (n + Math.imul(M, U))),
        (n = 0 | (n + Math.imul(w, Z))),
        (f = 0 | (f + Math.imul(w, U))),
        (r = 0 | (r + Math.imul(v, D))),
        (n = 0 | (n + Math.imul(v, W))),
        (n = 0 | (n + Math.imul(y, D))),
        (f = 0 | (f + Math.imul(y, W))),
        (r = 0 | (r + Math.imul(b, G))),
        (n = 0 | (n + Math.imul(b, Y))),
        (n = 0 | (n + Math.imul(p, G))),
        (f = 0 | (f + Math.imul(p, Y))),
        (r = 0 | (r + Math.imul(u, $))),
        (n = 0 | (n + Math.imul(u, te))),
        (n = 0 | (n + Math.imul(c, $))),
        (f = 0 | (f + Math.imul(c, te)));
      var Me = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (Me >>> 26))),
        (Me &= 67108863),
        (r = Math.imul(R, L)),
        (n = Math.imul(R, F)),
        (n = 0 | (n + Math.imul(I, L))),
        (f = Math.imul(I, F)),
        (r = 0 | (r + Math.imul(S, Z))),
        (n = 0 | (n + Math.imul(S, U))),
        (n = 0 | (n + Math.imul(A, Z))),
        (f = 0 | (f + Math.imul(A, U))),
        (r = 0 | (r + Math.imul(M, D))),
        (n = 0 | (n + Math.imul(M, W))),
        (n = 0 | (n + Math.imul(w, D))),
        (f = 0 | (f + Math.imul(w, W))),
        (r = 0 | (r + Math.imul(v, G))),
        (n = 0 | (n + Math.imul(v, Y))),
        (n = 0 | (n + Math.imul(y, G))),
        (f = 0 | (f + Math.imul(y, Y))),
        (r = 0 | (r + Math.imul(b, $))),
        (n = 0 | (n + Math.imul(b, te))),
        (n = 0 | (n + Math.imul(p, $))),
        (f = 0 | (f + Math.imul(p, te))),
        (r = 0 | (r + Math.imul(u, ie))),
        (n = 0 | (n + Math.imul(u, re))),
        (n = 0 | (n + Math.imul(c, ie))),
        (f = 0 | (f + Math.imul(c, re)));
      var we = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (we >>> 26))),
        (we &= 67108863),
        (r = Math.imul(k, L)),
        (n = Math.imul(k, F)),
        (n = 0 | (n + Math.imul(H, L))),
        (f = Math.imul(H, F)),
        (r = 0 | (r + Math.imul(R, Z))),
        (n = 0 | (n + Math.imul(R, U))),
        (n = 0 | (n + Math.imul(I, Z))),
        (f = 0 | (f + Math.imul(I, U))),
        (r = 0 | (r + Math.imul(S, D))),
        (n = 0 | (n + Math.imul(S, W))),
        (n = 0 | (n + Math.imul(A, D))),
        (f = 0 | (f + Math.imul(A, W))),
        (r = 0 | (r + Math.imul(M, G))),
        (n = 0 | (n + Math.imul(M, Y))),
        (n = 0 | (n + Math.imul(w, G))),
        (f = 0 | (f + Math.imul(w, Y))),
        (r = 0 | (r + Math.imul(v, $))),
        (n = 0 | (n + Math.imul(v, te))),
        (n = 0 | (n + Math.imul(y, $))),
        (f = 0 | (f + Math.imul(y, te))),
        (r = 0 | (r + Math.imul(b, ie))),
        (n = 0 | (n + Math.imul(b, re))),
        (n = 0 | (n + Math.imul(p, ie))),
        (f = 0 | (f + Math.imul(p, re))),
        (r = 0 | (r + Math.imul(u, fe))),
        (n = 0 | (n + Math.imul(u, ae))),
        (n = 0 | (n + Math.imul(c, fe))),
        (f = 0 | (f + Math.imul(c, ae)));
      var _e = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (_e >>> 26))),
        (_e &= 67108863),
        (r = Math.imul(q, L)),
        (n = Math.imul(q, F)),
        (n = 0 | (n + Math.imul(P, L))),
        (f = Math.imul(P, F)),
        (r = 0 | (r + Math.imul(k, Z))),
        (n = 0 | (n + Math.imul(k, U))),
        (n = 0 | (n + Math.imul(H, Z))),
        (f = 0 | (f + Math.imul(H, U))),
        (r = 0 | (r + Math.imul(R, D))),
        (n = 0 | (n + Math.imul(R, W))),
        (n = 0 | (n + Math.imul(I, D))),
        (f = 0 | (f + Math.imul(I, W))),
        (r = 0 | (r + Math.imul(S, G))),
        (n = 0 | (n + Math.imul(S, Y))),
        (n = 0 | (n + Math.imul(A, G))),
        (f = 0 | (f + Math.imul(A, Y))),
        (r = 0 | (r + Math.imul(M, $))),
        (n = 0 | (n + Math.imul(M, te))),
        (n = 0 | (n + Math.imul(w, $))),
        (f = 0 | (f + Math.imul(w, te))),
        (r = 0 | (r + Math.imul(v, ie))),
        (n = 0 | (n + Math.imul(v, re))),
        (n = 0 | (n + Math.imul(y, ie))),
        (f = 0 | (f + Math.imul(y, re))),
        (r = 0 | (r + Math.imul(b, fe))),
        (n = 0 | (n + Math.imul(b, ae))),
        (n = 0 | (n + Math.imul(p, fe))),
        (f = 0 | (f + Math.imul(p, ae))),
        (r = 0 | (r + Math.imul(u, se))),
        (n = 0 | (n + Math.imul(u, oe))),
        (n = 0 | (n + Math.imul(c, se))),
        (f = 0 | (f + Math.imul(c, oe)));
      var Se = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (Se >>> 26))),
        (Se &= 67108863),
        (r = Math.imul(C, L)),
        (n = Math.imul(C, F)),
        (n = 0 | (n + Math.imul(B, L))),
        (f = Math.imul(B, F)),
        (r = 0 | (r + Math.imul(q, Z))),
        (n = 0 | (n + Math.imul(q, U))),
        (n = 0 | (n + Math.imul(P, Z))),
        (f = 0 | (f + Math.imul(P, U))),
        (r = 0 | (r + Math.imul(k, D))),
        (n = 0 | (n + Math.imul(k, W))),
        (n = 0 | (n + Math.imul(H, D))),
        (f = 0 | (f + Math.imul(H, W))),
        (r = 0 | (r + Math.imul(R, G))),
        (n = 0 | (n + Math.imul(R, Y))),
        (n = 0 | (n + Math.imul(I, G))),
        (f = 0 | (f + Math.imul(I, Y))),
        (r = 0 | (r + Math.imul(S, $))),
        (n = 0 | (n + Math.imul(S, te))),
        (n = 0 | (n + Math.imul(A, $))),
        (f = 0 | (f + Math.imul(A, te))),
        (r = 0 | (r + Math.imul(M, ie))),
        (n = 0 | (n + Math.imul(M, re))),
        (n = 0 | (n + Math.imul(w, ie))),
        (f = 0 | (f + Math.imul(w, re))),
        (r = 0 | (r + Math.imul(v, fe))),
        (n = 0 | (n + Math.imul(v, ae))),
        (n = 0 | (n + Math.imul(y, fe))),
        (f = 0 | (f + Math.imul(y, ae))),
        (r = 0 | (r + Math.imul(b, se))),
        (n = 0 | (n + Math.imul(b, oe))),
        (n = 0 | (n + Math.imul(p, se))),
        (f = 0 | (f + Math.imul(p, oe))),
        (r = 0 | (r + Math.imul(u, ue))),
        (n = 0 | (n + Math.imul(u, ce))),
        (n = 0 | (n + Math.imul(c, ue))),
        (f = 0 | (f + Math.imul(c, ce)));
      var Ae = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (Ae >>> 26))),
        (Ae &= 67108863),
        (r = Math.imul(j, L)),
        (n = Math.imul(j, F)),
        (n = 0 | (n + Math.imul(X, L))),
        (f = Math.imul(X, F)),
        (r = 0 | (r + Math.imul(C, Z))),
        (n = 0 | (n + Math.imul(C, U))),
        (n = 0 | (n + Math.imul(B, Z))),
        (f = 0 | (f + Math.imul(B, U))),
        (r = 0 | (r + Math.imul(q, D))),
        (n = 0 | (n + Math.imul(q, W))),
        (n = 0 | (n + Math.imul(P, D))),
        (f = 0 | (f + Math.imul(P, W))),
        (r = 0 | (r + Math.imul(k, G))),
        (n = 0 | (n + Math.imul(k, Y))),
        (n = 0 | (n + Math.imul(H, G))),
        (f = 0 | (f + Math.imul(H, Y))),
        (r = 0 | (r + Math.imul(R, $))),
        (n = 0 | (n + Math.imul(R, te))),
        (n = 0 | (n + Math.imul(I, $))),
        (f = 0 | (f + Math.imul(I, te))),
        (r = 0 | (r + Math.imul(S, ie))),
        (n = 0 | (n + Math.imul(S, re))),
        (n = 0 | (n + Math.imul(A, ie))),
        (f = 0 | (f + Math.imul(A, re))),
        (r = 0 | (r + Math.imul(M, fe))),
        (n = 0 | (n + Math.imul(M, ae))),
        (n = 0 | (n + Math.imul(w, fe))),
        (f = 0 | (f + Math.imul(w, ae))),
        (r = 0 | (r + Math.imul(v, se))),
        (n = 0 | (n + Math.imul(v, oe))),
        (n = 0 | (n + Math.imul(y, se))),
        (f = 0 | (f + Math.imul(y, oe))),
        (r = 0 | (r + Math.imul(b, ue))),
        (n = 0 | (n + Math.imul(b, ce))),
        (n = 0 | (n + Math.imul(p, ue))),
        (f = 0 | (f + Math.imul(p, ce))),
        (r = 0 | (r + Math.imul(u, be))),
        (n = 0 | (n + Math.imul(u, pe))),
        (n = 0 | (n + Math.imul(c, be))),
        (f = 0 | (f + Math.imul(c, pe)));
      var xe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (xe >>> 26))),
        (xe &= 67108863),
        (r = Math.imul(j, Z)),
        (n = Math.imul(j, U)),
        (n = 0 | (n + Math.imul(X, Z))),
        (f = Math.imul(X, U)),
        (r = 0 | (r + Math.imul(C, D))),
        (n = 0 | (n + Math.imul(C, W))),
        (n = 0 | (n + Math.imul(B, D))),
        (f = 0 | (f + Math.imul(B, W))),
        (r = 0 | (r + Math.imul(q, G))),
        (n = 0 | (n + Math.imul(q, Y))),
        (n = 0 | (n + Math.imul(P, G))),
        (f = 0 | (f + Math.imul(P, Y))),
        (r = 0 | (r + Math.imul(k, $))),
        (n = 0 | (n + Math.imul(k, te))),
        (n = 0 | (n + Math.imul(H, $))),
        (f = 0 | (f + Math.imul(H, te))),
        (r = 0 | (r + Math.imul(R, ie))),
        (n = 0 | (n + Math.imul(R, re))),
        (n = 0 | (n + Math.imul(I, ie))),
        (f = 0 | (f + Math.imul(I, re))),
        (r = 0 | (r + Math.imul(S, fe))),
        (n = 0 | (n + Math.imul(S, ae))),
        (n = 0 | (n + Math.imul(A, fe))),
        (f = 0 | (f + Math.imul(A, ae))),
        (r = 0 | (r + Math.imul(M, se))),
        (n = 0 | (n + Math.imul(M, oe))),
        (n = 0 | (n + Math.imul(w, se))),
        (f = 0 | (f + Math.imul(w, oe))),
        (r = 0 | (r + Math.imul(v, ue))),
        (n = 0 | (n + Math.imul(v, ce))),
        (n = 0 | (n + Math.imul(y, ue))),
        (f = 0 | (f + Math.imul(y, ce))),
        (r = 0 | (r + Math.imul(b, be))),
        (n = 0 | (n + Math.imul(b, pe))),
        (n = 0 | (n + Math.imul(p, be))),
        (f = 0 | (f + Math.imul(p, pe)));
      var Re = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (Re >>> 26))),
        (Re &= 67108863),
        (r = Math.imul(j, D)),
        (n = Math.imul(j, W)),
        (n = 0 | (n + Math.imul(X, D))),
        (f = Math.imul(X, W)),
        (r = 0 | (r + Math.imul(C, G))),
        (n = 0 | (n + Math.imul(C, Y))),
        (n = 0 | (n + Math.imul(B, G))),
        (f = 0 | (f + Math.imul(B, Y))),
        (r = 0 | (r + Math.imul(q, $))),
        (n = 0 | (n + Math.imul(q, te))),
        (n = 0 | (n + Math.imul(P, $))),
        (f = 0 | (f + Math.imul(P, te))),
        (r = 0 | (r + Math.imul(k, ie))),
        (n = 0 | (n + Math.imul(k, re))),
        (n = 0 | (n + Math.imul(H, ie))),
        (f = 0 | (f + Math.imul(H, re))),
        (r = 0 | (r + Math.imul(R, fe))),
        (n = 0 | (n + Math.imul(R, ae))),
        (n = 0 | (n + Math.imul(I, fe))),
        (f = 0 | (f + Math.imul(I, ae))),
        (r = 0 | (r + Math.imul(S, se))),
        (n = 0 | (n + Math.imul(S, oe))),
        (n = 0 | (n + Math.imul(A, se))),
        (f = 0 | (f + Math.imul(A, oe))),
        (r = 0 | (r + Math.imul(M, ue))),
        (n = 0 | (n + Math.imul(M, ce))),
        (n = 0 | (n + Math.imul(w, ue))),
        (f = 0 | (f + Math.imul(w, ce))),
        (r = 0 | (r + Math.imul(v, be))),
        (n = 0 | (n + Math.imul(v, pe))),
        (n = 0 | (n + Math.imul(y, be))),
        (f = 0 | (f + Math.imul(y, pe)));
      var Ie = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (Ie >>> 26))),
        (Ie &= 67108863),
        (r = Math.imul(j, G)),
        (n = Math.imul(j, Y)),
        (n = 0 | (n + Math.imul(X, G))),
        (f = Math.imul(X, Y)),
        (r = 0 | (r + Math.imul(C, $))),
        (n = 0 | (n + Math.imul(C, te))),
        (n = 0 | (n + Math.imul(B, $))),
        (f = 0 | (f + Math.imul(B, te))),
        (r = 0 | (r + Math.imul(q, ie))),
        (n = 0 | (n + Math.imul(q, re))),
        (n = 0 | (n + Math.imul(P, ie))),
        (f = 0 | (f + Math.imul(P, re))),
        (r = 0 | (r + Math.imul(k, fe))),
        (n = 0 | (n + Math.imul(k, ae))),
        (n = 0 | (n + Math.imul(H, fe))),
        (f = 0 | (f + Math.imul(H, ae))),
        (r = 0 | (r + Math.imul(R, se))),
        (n = 0 | (n + Math.imul(R, oe))),
        (n = 0 | (n + Math.imul(I, se))),
        (f = 0 | (f + Math.imul(I, oe))),
        (r = 0 | (r + Math.imul(S, ue))),
        (n = 0 | (n + Math.imul(S, ce))),
        (n = 0 | (n + Math.imul(A, ue))),
        (f = 0 | (f + Math.imul(A, ce))),
        (r = 0 | (r + Math.imul(M, be))),
        (n = 0 | (n + Math.imul(M, pe))),
        (n = 0 | (n + Math.imul(w, be))),
        (f = 0 | (f + Math.imul(w, pe)));
      var Ee = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (Ee >>> 26))),
        (Ee &= 67108863),
        (r = Math.imul(j, $)),
        (n = Math.imul(j, te)),
        (n = 0 | (n + Math.imul(X, $))),
        (f = Math.imul(X, te)),
        (r = 0 | (r + Math.imul(C, ie))),
        (n = 0 | (n + Math.imul(C, re))),
        (n = 0 | (n + Math.imul(B, ie))),
        (f = 0 | (f + Math.imul(B, re))),
        (r = 0 | (r + Math.imul(q, fe))),
        (n = 0 | (n + Math.imul(q, ae))),
        (n = 0 | (n + Math.imul(P, fe))),
        (f = 0 | (f + Math.imul(P, ae))),
        (r = 0 | (r + Math.imul(k, se))),
        (n = 0 | (n + Math.imul(k, oe))),
        (n = 0 | (n + Math.imul(H, se))),
        (f = 0 | (f + Math.imul(H, oe))),
        (r = 0 | (r + Math.imul(R, ue))),
        (n = 0 | (n + Math.imul(R, ce))),
        (n = 0 | (n + Math.imul(I, ue))),
        (f = 0 | (f + Math.imul(I, ce))),
        (r = 0 | (r + Math.imul(S, be))),
        (n = 0 | (n + Math.imul(S, pe))),
        (n = 0 | (n + Math.imul(A, be))),
        (f = 0 | (f + Math.imul(A, pe)));
      var ke = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (ke >>> 26))),
        (ke &= 67108863),
        (r = Math.imul(j, ie)),
        (n = Math.imul(j, re)),
        (n = 0 | (n + Math.imul(X, ie))),
        (f = Math.imul(X, re)),
        (r = 0 | (r + Math.imul(C, fe))),
        (n = 0 | (n + Math.imul(C, ae))),
        (n = 0 | (n + Math.imul(B, fe))),
        (f = 0 | (f + Math.imul(B, ae))),
        (r = 0 | (r + Math.imul(q, se))),
        (n = 0 | (n + Math.imul(q, oe))),
        (n = 0 | (n + Math.imul(P, se))),
        (f = 0 | (f + Math.imul(P, oe))),
        (r = 0 | (r + Math.imul(k, ue))),
        (n = 0 | (n + Math.imul(k, ce))),
        (n = 0 | (n + Math.imul(H, ue))),
        (f = 0 | (f + Math.imul(H, ce))),
        (r = 0 | (r + Math.imul(R, be))),
        (n = 0 | (n + Math.imul(R, pe))),
        (n = 0 | (n + Math.imul(I, be))),
        (f = 0 | (f + Math.imul(I, pe)));
      var He = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (He >>> 26))),
        (He &= 67108863),
        (r = Math.imul(j, fe)),
        (n = Math.imul(j, ae)),
        (n = 0 | (n + Math.imul(X, fe))),
        (f = Math.imul(X, ae)),
        (r = 0 | (r + Math.imul(C, se))),
        (n = 0 | (n + Math.imul(C, oe))),
        (n = 0 | (n + Math.imul(B, se))),
        (f = 0 | (f + Math.imul(B, oe))),
        (r = 0 | (r + Math.imul(q, ue))),
        (n = 0 | (n + Math.imul(q, ce))),
        (n = 0 | (n + Math.imul(P, ue))),
        (f = 0 | (f + Math.imul(P, ce))),
        (r = 0 | (r + Math.imul(k, be))),
        (n = 0 | (n + Math.imul(k, pe))),
        (n = 0 | (n + Math.imul(H, be))),
        (f = 0 | (f + Math.imul(H, pe)));
      var ze = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (ze >>> 26))),
        (ze &= 67108863),
        (r = Math.imul(j, se)),
        (n = Math.imul(j, oe)),
        (n = 0 | (n + Math.imul(X, se))),
        (f = Math.imul(X, oe)),
        (r = 0 | (r + Math.imul(C, ue))),
        (n = 0 | (n + Math.imul(C, ce))),
        (n = 0 | (n + Math.imul(B, ue))),
        (f = 0 | (f + Math.imul(B, ce))),
        (r = 0 | (r + Math.imul(q, be))),
        (n = 0 | (n + Math.imul(q, pe))),
        (n = 0 | (n + Math.imul(P, be))),
        (f = 0 | (f + Math.imul(P, pe)));
      var qe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (qe >>> 26))),
        (qe &= 67108863),
        (r = Math.imul(j, ue)),
        (n = Math.imul(j, ce)),
        (n = 0 | (n + Math.imul(X, ue))),
        (f = Math.imul(X, ce)),
        (r = 0 | (r + Math.imul(C, be))),
        (n = 0 | (n + Math.imul(C, pe))),
        (n = 0 | (n + Math.imul(B, be))),
        (f = 0 | (f + Math.imul(B, pe)));
      var Pe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      (o = 0 | ((0 | (f + (n >>> 13))) + (Pe >>> 26))),
        (Pe &= 67108863),
        (r = Math.imul(j, be)),
        (n = Math.imul(j, pe)),
        (n = 0 | (n + Math.imul(X, be))),
        (f = Math.imul(X, pe));
      var Oe = 0 | ((0 | (o + r)) + ((8191 & n) << 13));
      return (
        (o = 0 | ((0 | (f + (n >>> 13))) + (Oe >>> 26))),
        (Oe &= 67108863),
        (s[0] = me),
        (s[1] = ve),
        (s[2] = ye),
        (s[3] = ge),
        (s[4] = Me),
        (s[5] = we),
        (s[6] = _e),
        (s[7] = Se),
        (s[8] = Ae),
        (s[9] = xe),
        (s[10] = Re),
        (s[11] = Ie),
        (s[12] = Ee),
        (s[13] = ke),
        (s[14] = He),
        (s[15] = ze),
        (s[16] = qe),
        (s[17] = Pe),
        (s[18] = Oe),
        0 !== o && ((s[19] = o), i.length++),
        i
      );
    };
    Math.imul || (x = s),
      (n.prototype.mulTo = function (t, e) {
        var i;
        console.log("AAAAA");
        var r = this.length + t.length;
        return (i = 10 === this.length && 10 === t.length ? x(this, t, e) : 63 > r ? s(this, t, e) : 1024 > r ? o(this, t, e) : d(this, t, e));
      }),
      (u.prototype.makeRBT = function (t) {
        for (var e = Array(t), i = n.prototype._countBits(t) - 1, r = 0; t > r; r++) e[r] = this.revBin(r, i, t);
        return e;
      }),
      (u.prototype.revBin = function (t, e, i) {
        if (0 === t || t === i - 1) return t;
        for (var r = 0, n = 0; e > n; n++) (r |= (1 & t) << (e - n - 1)), (t >>= 1);
        return r;
      }),
      (u.prototype.permute = function (t, e, i, r, n, f) {
        for (var a = 0; f > a; a++) (r[a] = e[t[a]]), (n[a] = i[t[a]]);
      }),
      (u.prototype.transform = function (t, e, i, r, n, f) {
        this.permute(f, t, e, i, r, n);
        for (var a = 1; n > a; a <<= 1)
          for (var h = a << 1, s = Math.cos((2 * Math.PI) / h), o = Math.sin((2 * Math.PI) / h), d = 0; n > d; d += h)
            for (var u = s, c = o, l = 0; a > l; l++) {
              var b = i[d + l],
                p = r[d + l],
                m = i[d + l + a],
                v = r[d + l + a],
                y = u * m - c * v;
              (v = u * v + c * m),
                (m = y),
                (i[d + l] = b + m),
                (r[d + l] = p + v),
                (i[d + l + a] = b - m),
                (r[d + l + a] = p - v),
                l !== h && ((y = s * u - o * c), (c = s * c + o * u), (u = y));
            }
      }),
      (u.prototype.guessLen13b = function (t, e) {
        var i = 1 | Math.max(e, t),
          r = 1 & i,
          n = 0;
        for (i = 0 | (i / 2); i; i >>>= 1) n++;
        return 1 << (n + 1 + r);
      }),
      (u.prototype.conjugate = function (t, e, i) {
        if (!(1 >= i))
          for (var r = 0; i / 2 > r; r++) {
            var n = t[r];
            (t[r] = t[i - r - 1]), (t[i - r - 1] = n), (n = e[r]), (e[r] = -e[i - r - 1]), (e[i - r - 1] = -n);
          }
      }),
      (u.prototype.normalize13b = function (t, e) {
        for (var i = 0, r = 0; e / 2 > r; r++) {
          var n = 8192 * Math.round(t[2 * r + 1] / e) + Math.round(t[2 * r] / e) + i;
          (t[r] = 67108863 & n), (i = 67108864 > n ? 0 : 0 | (n / 67108864));
        }
        return t;
      }),
      (u.prototype.convert13b = function (t, e, r, n) {
        for (var f = 0, a = 0; e > a; a++) (f += 0 | t[a]), (r[2 * a] = 8191 & f), (f >>>= 13), (r[2 * a + 1] = 8191 & f), (f >>>= 13);
        for (a = 2 * e; n > a; ++a) r[a] = 0;
        i(0 === f), i(0 === (-8192 & f));
      }),
      (u.prototype.stub = function (t) {
        for (var e = Array(t), i = 0; t > i; i++) e[i] = 0;
        return e;
      }),
      (u.prototype.mulp = function (t, e, i) {
        var r = 2 * this.guessLen13b(t.length, e.length),
          n = this.makeRBT(r),
          f = this.stub(r),
          a = Array(r),
          h = Array(r),
          s = Array(r),
          o = Array(r),
          d = Array(r),
          u = Array(r),
          c = i.words;
        (c.length = r),
          this.convert13b(t.words, t.length, a, r),
          this.convert13b(e.words, e.length, o, r),
          this.transform(a, f, h, s, r, n),
          this.transform(o, f, d, u, r, n);
        for (var l = 0; r > l; l++) {
          var b = h[l] * d[l] - s[l] * u[l];
          (s[l] = h[l] * u[l] + s[l] * d[l]), (h[l] = b);
        }
        return (
          this.conjugate(h, s, r),
          this.transform(h, s, c, f, r, n),
          this.conjugate(c, f, r),
          this.normalize13b(c, r),
          (i.negative = t.negative ^ e.negative),
          (i.length = t.length + e.length),
          i._strip()
        );
      }),
      (n.prototype.mul = function (t) {
        var e = new n(null);
        return (e.words = Array(this.length + t.length)), this.mulTo(t, e);
      }),
      (n.prototype.mulf = function (t) {
        var e = new n(null);
        return (e.words = Array(this.length + t.length)), d(this, t, e);
      }),
      (n.prototype.imul = function (t) {
        return this.clone().mulTo(t, this);
      }),
      (n.prototype.imuln = function (t) {
        var e = 0 > t;
        e && (t = -t), i("number" == typeof t), i(67108864 > t);
        for (var r = 0, n = 0; this.length > n; n++) {
          var f = (0 | this.words[n]) * t,
            a = (67108863 & f) + (67108863 & r);
          (r >>= 26), (r += 0 | (f / 67108864)), (r += a >>> 26), (this.words[n] = 67108863 & a);
        }
        return 0 !== r && ((this.words[n] = r), this.length++), e ? this.ineg() : this;
      }),
      (n.prototype.muln = function (t) {
        return this.clone().imuln(t);
      }),
      (n.prototype.sqr = function () {
        return this.mul(this);
      }),
      (n.prototype.isqr = function () {
        return this.imul(this.clone());
      }),
      (n.prototype.pow = function (t) {
        var e = h(t);
        if (0 === e.length) return new n(1);
        for (var i = this, r = 0; e.length > r && 0 === e[r]; r++, i = i.sqr());
        if (++r < e.length) for (var f = i.sqr(); e.length > r; r++, f = f.sqr()) 0 !== e[r] && (i = i.mul(f));
        return i;
      }),
      (n.prototype.iushln = function (t) {
        i("number" == typeof t && t >= 0);
        var e,
          r = t % 26,
          n = (t - r) / 26,
          f = (67108863 >>> (26 - r)) << (26 - r);
        if (0 !== r) {
          var a = 0;
          for (e = 0; this.length > e; e++) {
            var h = this.words[e] & f,
              s = ((0 | this.words[e]) - h) << r;
            (this.words[e] = s | a), (a = h >>> (26 - r));
          }
          a && ((this.words[e] = a), this.length++);
        }
        if (0 !== n) {
          for (e = this.length - 1; e >= 0; e--) this.words[e + n] = this.words[e];
          for (e = 0; n > e; e++) this.words[e] = 0;
          this.length += n;
        }
        return this._strip();
      }),
      (n.prototype.ishln = function (t) {
        return i(0 === this.negative), this.iushln(t);
      }),
      (n.prototype.iushrn = function (t, e, r) {
        i("number" == typeof t && t >= 0);
        var n;
        n = e ? (e - (e % 26)) / 26 : 0;
        var f = t % 26,
          a = Math.min((t - f) / 26, this.length),
          h = 67108863 ^ ((67108863 >>> f) << f),
          s = r;
        if (((n -= a), (n = Math.max(0, n)), s)) {
          for (var o = 0; a > o; o++) s.words[o] = this.words[o];
          s.length = a;
        }
        if (0 === a);
        else if (this.length > a) for (this.length -= a, o = 0; this.length > o; o++) this.words[o] = this.words[o + a];
        else (this.words[0] = 0), (this.length = 1);
        var d = 0;
        for (o = this.length - 1; o >= 0 && (0 !== d || o >= n); o--) {
          var u = 0 | this.words[o];
          (this.words[o] = (d << (26 - f)) | (u >>> f)), (d = u & h);
        }
        return s && 0 !== d && (s.words[s.length++] = d), 0 === this.length && ((this.words[0] = 0), (this.length = 1)), this._strip();
      }),
      (n.prototype.ishrn = function (t, e, r) {
        return i(0 === this.negative), this.iushrn(t, e, r);
      }),
      (n.prototype.shln = function (t) {
        return this.clone().ishln(t);
      }),
      (n.prototype.ushln = function (t) {
        return this.clone().iushln(t);
      }),
      (n.prototype.shrn = function (t) {
        return this.clone().ishrn(t);
      }),
      (n.prototype.ushrn = function (t) {
        return this.clone().iushrn(t);
      }),
      (n.prototype.testn = function (t) {
        i("number" == typeof t && t >= 0);
        var e = t % 26,
          r = (t - e) / 26,
          n = 1 << e;
        if (r >= this.length) return !1;
        var f = this.words[r];
        return !!(f & n);
      }),
      (n.prototype.imaskn = function (t) {
        i("number" == typeof t && t >= 0);
        var e = t % 26,
          r = (t - e) / 26;
        if ((i(0 === this.negative, "imaskn works only with positive numbers"), r >= this.length)) return this;
        if ((0 !== e && r++, (this.length = Math.min(r, this.length)), 0 !== e)) {
          var n = 67108863 ^ ((67108863 >>> e) << e);
          this.words[this.length - 1] &= n;
        }
        return this._strip();
      }),
      (n.prototype.maskn = function (t) {
        return this.clone().imaskn(t);
      }),
      (n.prototype.iaddn = function (t) {
        return (
          i("number" == typeof t),
          i(67108864 > t),
          0 > t
            ? this.isubn(-t)
            : 0 !== this.negative
            ? 1 === this.length && t > (0 | this.words[0])
              ? ((this.words[0] = t - (0 | this.words[0])), (this.negative = 0), this)
              : ((this.negative = 0), this.isubn(t), (this.negative = 1), this)
            : this._iaddn(t)
        );
      }),
      (n.prototype._iaddn = function (t) {
        this.words[0] += t;
        for (var e = 0; this.length > e && this.words[e] >= 67108864; e++)
          (this.words[e] -= 67108864), e === this.length - 1 ? (this.words[e + 1] = 1) : this.words[e + 1]++;
        return (this.length = Math.max(this.length, e + 1)), this;
      }),
      (n.prototype.isubn = function (t) {
        if ((i("number" == typeof t), i(67108864 > t), 0 > t)) return this.iaddn(-t);
        if (0 !== this.negative) return (this.negative = 0), this.iaddn(t), (this.negative = 1), this;
        if (((this.words[0] -= t), 1 === this.length && 0 > this.words[0])) (this.words[0] = -this.words[0]), (this.negative = 1);
        else for (var e = 0; this.length > e && 0 > this.words[e]; e++) (this.words[e] += 67108864), (this.words[e + 1] -= 1);
        return this._strip();
      }),
      (n.prototype.addn = function (t) {
        return this.clone().iaddn(t);
      }),
      (n.prototype.subn = function (t) {
        return this.clone().isubn(t);
      }),
      (n.prototype.iabs = function () {
        return (this.negative = 0), this;
      }),
      (n.prototype.abs = function () {
        return this.clone().iabs();
      }),
      (n.prototype._ishlnsubmul = function (t, e, r) {
        var n,
          f = t.length + r;
        this._expand(f);
        var a,
          h = 0;
        for (n = 0; t.length > n; n++) {
          a = (0 | this.words[n + r]) + h;
          var s = (0 | t.words[n]) * e;
          (a -= 67108863 & s), (h = (a >> 26) - (0 | (s / 67108864))), (this.words[n + r] = 67108863 & a);
        }
        for (; this.length - r > n; n++) (a = (0 | this.words[n + r]) + h), (h = a >> 26), (this.words[n + r] = 67108863 & a);
        if (0 === h) return this._strip();
        for (i(-1 === h), h = 0, n = 0; this.length > n; n++) (a = -(0 | this.words[n]) + h), (h = a >> 26), (this.words[n] = 67108863 & a);
        return (this.negative = 1), this._strip();
      }),
      (n.prototype._wordDiv = function (t, e) {
        var i = this.length - t.length,
          r = this.clone(),
          f = t,
          a = 0 | f.words[f.length - 1],
          h = this._countBits(a);
        (i = 26 - h), 0 !== i && ((f = f.ushln(i)), r.iushln(i), (a = 0 | f.words[f.length - 1]));
        var s,
          o = r.length - f.length;
        if ("mod" !== e) {
          (s = new n(null)), (s.length = o + 1), (s.words = Array(s.length));
          for (var d = 0; s.length > d; d++) s.words[d] = 0;
        }
        var u = r.clone()._ishlnsubmul(f, 1, o);
        0 === u.negative && ((r = u), s && (s.words[o] = 1));
        for (var c = o - 1; c >= 0; c--) {
          var l = 67108864 * (0 | r.words[f.length + c]) + (0 | r.words[f.length + c - 1]);
          for (l = Math.min(0 | (l / a), 67108863), r._ishlnsubmul(f, l, c); 0 !== r.negative; )
            l--, (r.negative = 0), r._ishlnsubmul(f, 1, c), r.isZero() || (r.negative ^= 1);
          s && (s.words[c] = l);
        }
        return s && s._strip(), r._strip(), "div" !== e && 0 !== i && r.iushrn(i), { div: s || null, mod: r };
      }),
      (n.prototype.divmod = function (t, e, r) {
        if ((i(!t.isZero()), this.isZero())) return { div: new n(0), mod: new n(0) };
        var f, a, h;
        return 0 !== this.negative && 0 === t.negative
          ? ((h = this.neg().divmod(t, e)),
            "mod" !== e && (f = h.div.neg()),
            "div" !== e && ((a = h.mod.neg()), r && 0 !== a.negative && a.iadd(t)),
            { div: f, mod: a })
          : 0 === this.negative && 0 !== t.negative
          ? ((h = this.divmod(t.neg(), e)), "mod" !== e && (f = h.div.neg()), { div: f, mod: h.mod })
          : 0 !== (this.negative & t.negative)
          ? ((h = this.neg().divmod(t.neg(), e)), "div" !== e && ((a = h.mod.neg()), r && 0 !== a.negative && a.isub(t)), { div: h.div, mod: a })
          : t.length > this.length || 0 > this.cmp(t)
          ? { div: new n(0), mod: this }
          : 1 === t.length
          ? "div" === e
            ? { div: this.divn(t.words[0]), mod: null }
            : "mod" === e
            ? { div: null, mod: new n(this.modrn(t.words[0])) }
            : { div: this.divn(t.words[0]), mod: new n(this.modrn(t.words[0])) }
          : this._wordDiv(t, e);
      }),
      (n.prototype.div = function (t) {
        return this.divmod(t, "div", !1).div;
      }),
      (n.prototype.mod = function (t) {
        return this.divmod(t, "mod", !1).mod;
      }),
      (n.prototype.umod = function (t) {
        return this.divmod(t, "mod", !0).mod;
      }),
      (n.prototype.divRound = function (t) {
        var e = this.divmod(t);
        if (e.mod.isZero()) return e.div;
        var i = 0 !== e.div.negative ? e.mod.isub(t) : e.mod,
          r = t.ushrn(1),
          n = t.andln(1),
          f = i.cmp(r);
        return 0 > f || (1 === n && 0 === f) ? e.div : 0 !== e.div.negative ? e.div.isubn(1) : e.div.iaddn(1);
      }),
      (n.prototype.modrn = function (t) {
        var e = 0 > t;
        e && (t = -t), i(67108863 >= t);
        for (var r = (1 << 26) % t, n = 0, f = this.length - 1; f >= 0; f--) n = (r * n + (0 | this.words[f])) % t;
        return e ? -n : n;
      }),
      (n.prototype.modn = function (t) {
        return this.modrn(t);
      }),
      (n.prototype.idivn = function (t) {
        var e = 0 > t;
        e && (t = -t), i(67108863 >= t);
        for (var r = 0, n = this.length - 1; n >= 0; n--) {
          var f = (0 | this.words[n]) + 67108864 * r;
          (this.words[n] = 0 | (f / t)), (r = f % t);
        }
        return this._strip(), e ? this.ineg() : this;
      }),
      (n.prototype.divn = function (t) {
        return this.clone().idivn(t);
      }),
      (n.prototype.egcd = function (t) {
        i(0 === t.negative), i(!t.isZero());
        var e = this,
          r = t.clone();
        e = 0 !== e.negative ? e.umod(t) : e.clone();
        for (var f = new n(1), a = new n(0), h = new n(0), s = new n(1), o = 0; e.isEven() && r.isEven(); ) e.iushrn(1), r.iushrn(1), ++o;
        for (var d = r.clone(), u = e.clone(); !e.isZero(); ) {
          for (var c = 0, l = 1; 0 === (e.words[0] & l) && 26 > c; ++c, l <<= 1);
          if (c > 0) for (e.iushrn(c); c-- > 0; ) (f.isOdd() || a.isOdd()) && (f.iadd(d), a.isub(u)), f.iushrn(1), a.iushrn(1);
          for (var b = 0, p = 1; 0 === (r.words[0] & p) && 26 > b; ++b, p <<= 1);
          if (b > 0) for (r.iushrn(b); b-- > 0; ) (h.isOdd() || s.isOdd()) && (h.iadd(d), s.isub(u)), h.iushrn(1), s.iushrn(1);
          e.cmp(r) >= 0 ? (e.isub(r), f.isub(h), a.isub(s)) : (r.isub(e), h.isub(f), s.isub(a));
        }
        return { a: h, b: s, gcd: r.iushln(o) };
      }),
      (n.prototype._invmp = function (t) {
        i(0 === t.negative), i(!t.isZero());
        var e = this,
          r = t.clone();
        e = 0 !== e.negative ? e.umod(t) : e.clone();
        for (var f = new n(1), a = new n(0), h = r.clone(); e.cmpn(1) > 0 && r.cmpn(1) > 0; ) {
          for (var s = 0, o = 1; 0 === (e.words[0] & o) && 26 > s; ++s, o <<= 1);
          if (s > 0) for (e.iushrn(s); s-- > 0; ) f.isOdd() && f.iadd(h), f.iushrn(1);
          for (var d = 0, u = 1; 0 === (r.words[0] & u) && 26 > d; ++d, u <<= 1);
          if (d > 0) for (r.iushrn(d); d-- > 0; ) a.isOdd() && a.iadd(h), a.iushrn(1);
          e.cmp(r) >= 0 ? (e.isub(r), f.isub(a)) : (r.isub(e), a.isub(f));
        }
        var c;
        return (c = 0 === e.cmpn(1) ? f : a), 0 > c.cmpn(0) && c.iadd(t), c;
      }),
      (n.prototype.gcd = function (t) {
        if (this.isZero()) return t.abs();
        if (t.isZero()) return this.abs();
        var e = this.clone(),
          i = t.clone();
        (e.negative = 0), (i.negative = 0);
        for (var r = 0; e.isEven() && i.isEven(); r++) e.iushrn(1), i.iushrn(1);
        for (;;) {
          for (; e.isEven(); ) e.iushrn(1);
          for (; i.isEven(); ) i.iushrn(1);
          var n = e.cmp(i);
          if (0 > n) {
            var f = e;
            (e = i), (i = f);
          } else if (0 === n || 0 === i.cmpn(1)) break;
          e.isub(i);
        }
        return i.iushln(r);
      }),
      (n.prototype.invm = function (t) {
        return this.egcd(t).a.umod(t);
      }),
      (n.prototype.isEven = function () {
        return 0 === (1 & this.words[0]);
      }),
      (n.prototype.isOdd = function () {
        return 1 === (1 & this.words[0]);
      }),
      (n.prototype.andln = function (t) {
        return this.words[0] & t;
      }),
      (n.prototype.bincn = function (t) {
        i("number" == typeof t);
        var e = t % 26,
          r = (t - e) / 26,
          n = 1 << e;
        if (r >= this.length) return this._expand(r + 1), (this.words[r] |= n), this;
        for (var f = n, a = r; 0 !== f && this.length > a; a++) {
          var h = 0 | this.words[a];
          (h += f), (f = h >>> 26), (h &= 67108863), (this.words[a] = h);
        }
        return 0 !== f && ((this.words[a] = f), this.length++), this;
      }),
      (n.prototype.isZero = function () {
        return 1 === this.length && 0 === this.words[0];
      }),
      (n.prototype.cmpn = function (t) {
        var e = 0 > t;
        if (0 !== this.negative && !e) return -1;
        if (0 === this.negative && e) return 1;
        this._strip();
        var r;
        if (this.length > 1) r = 1;
        else {
          e && (t = -t), i(67108863 >= t, "Number is too big");
          var n = 0 | this.words[0];
          r = n === t ? 0 : t > n ? -1 : 1;
        }
        return 0 !== this.negative ? 0 | -r : r;
      }),
      (n.prototype.cmp = function (t) {
        if (0 !== this.negative && 0 === t.negative) return -1;
        if (0 === this.negative && 0 !== t.negative) return 1;
        var e = this.ucmp(t);
        return 0 !== this.negative ? 0 | -e : e;
      }),
      (n.prototype.ucmp = function (t) {
        if (this.length > t.length) return 1;
        if (this.length < t.length) return -1;
        for (var e = 0, i = this.length - 1; i >= 0; i--) {
          var r = 0 | this.words[i],
            n = 0 | t.words[i];
          if (r !== n) {
            n > r ? (e = -1) : r > n && (e = 1);
            break;
          }
        }
        return e;
      }),
      (n.prototype.gtn = function (t) {
        return 1 === this.cmpn(t);
      }),
      (n.prototype.gt = function (t) {
        return 1 === this.cmp(t);
      }),
      (n.prototype.gten = function (t) {
        return this.cmpn(t) >= 0;
      }),
      (n.prototype.gte = function (t) {
        return this.cmp(t) >= 0;
      }),
      (n.prototype.ltn = function (t) {
        return -1 === this.cmpn(t);
      }),
      (n.prototype.lt = function (t) {
        return -1 === this.cmp(t);
      }),
      (n.prototype.lten = function (t) {
        return 0 >= this.cmpn(t);
      }),
      (n.prototype.lte = function (t) {
        return 0 >= this.cmp(t);
      }),
      (n.prototype.eqn = function (t) {
        return 0 === this.cmpn(t);
      }),
      (n.prototype.eq = function (t) {
        return 0 === this.cmp(t);
      }),
      (n.red = function (t) {
        return new v(t);
      }),
      (n.prototype.toRed = function (t) {
        return (
          i(!this.red, "Already a number in reduction context"),
          i(0 === this.negative, "red works only with positives"),
          t.convertTo(this)._forceRed(t)
        );
      }),
      (n.prototype.fromRed = function () {
        return i(this.red, "fromRed works only with numbers in reduction context"), this.red.convertFrom(this);
      }),
      (n.prototype._forceRed = function (t) {
        return (this.red = t), this;
      }),
      (n.prototype.forceRed = function (t) {
        return i(!this.red, "Already a number in reduction context"), this._forceRed(t);
      }),
      (n.prototype.redAdd = function (t) {
        return i(this.red, "redAdd works only with red numbers"), this.red.add(this, t);
      }),
      (n.prototype.redIAdd = function (t) {
        return i(this.red, "redIAdd works only with red numbers"), this.red.iadd(this, t);
      }),
      (n.prototype.redSub = function (t) {
        return i(this.red, "redSub works only with red numbers"), this.red.sub(this, t);
      }),
      (n.prototype.redISub = function (t) {
        return i(this.red, "redISub works only with red numbers"), this.red.isub(this, t);
      }),
      (n.prototype.redShl = function (t) {
        return i(this.red, "redShl works only with red numbers"), this.red.shl(this, t);
      }),
      (n.prototype.redMul = function (t) {
        return i(this.red, "redMul works only with red numbers"), this.red._verify2(this, t), this.red.mul(this, t);
      }),
      (n.prototype.redIMul = function (t) {
        return i(this.red, "redMul works only with red numbers"), this.red._verify2(this, t), this.red.imul(this, t);
      }),
      (n.prototype.redSqr = function () {
        return i(this.red, "redSqr works only with red numbers"), this.red._verify1(this), this.red.sqr(this);
      }),
      (n.prototype.redISqr = function () {
        return i(this.red, "redISqr works only with red numbers"), this.red._verify1(this), this.red.isqr(this);
      }),
      (n.prototype.redSqrt = function () {
        return i(this.red, "redSqrt works only with red numbers"), this.red._verify1(this), this.red.sqrt(this);
      }),
      (n.prototype.redInvm = function () {
        return i(this.red, "redInvm works only with red numbers"), this.red._verify1(this), this.red.invm(this);
      }),
      (n.prototype.redNeg = function () {
        return i(this.red, "redNeg works only with red numbers"), this.red._verify1(this), this.red.neg(this);
      }),
      (n.prototype.redPow = function (t) {
        return i(this.red && !t.red, "redPow(normalNum)"), this.red._verify1(this), this.red.pow(this, t);
      });
    var R = { k256: null, p224: null, p192: null, p25519: null };
    (c.prototype._tmp = function () {
      var t = new n(null);
      return (t.words = Array(Math.ceil(this.n / 13))), t;
    }),
      (c.prototype.ireduce = function (t) {
        var e,
          i = t;
        do this.split(i, this.tmp), (i = this.imulK(i)), (i = i.iadd(this.tmp)), (e = i.bitLength());
        while (e > this.n);
        var r = this.n > e ? -1 : i.ucmp(this.p);
        return 0 === r ? ((i.words[0] = 0), (i.length = 1)) : r > 0 ? i.isub(this.p) : i._strip(), i;
      }),
      (c.prototype.split = function (t, e) {
        t.iushrn(this.n, 0, e);
      }),
      (c.prototype.imulK = function (t) {
        return t.imul(this.k);
      }),
      r(l, c),
      (l.prototype.split = function (t, e) {
        for (var i = 4194303, r = Math.min(t.length, 9), n = 0; r > n; n++) e.words[n] = t.words[n];
        if (((e.length = r), 9 >= t.length)) return (t.words[0] = 0), (t.length = 1), void 0;
        var f = t.words[9];
        for (e.words[e.length++] = f & i, n = 10; t.length > n; n++) {
          var a = 0 | t.words[n];
          (t.words[n - 10] = ((a & i) << 4) | (f >>> 22)), (f = a);
        }
        (f >>>= 22), (t.words[n - 10] = f), (t.length -= 0 === f && t.length > 10 ? 10 : 9);
      }),
      (l.prototype.imulK = function (t) {
        (t.words[t.length] = 0), (t.words[t.length + 1] = 0), (t.length += 2);
        for (var e = 0, i = 0; t.length > i; i++) {
          var r = 0 | t.words[i];
          (e += 977 * r), (t.words[i] = 67108863 & e), (e = 64 * r + (0 | (e / 67108864)));
        }
        return 0 === t.words[t.length - 1] && (t.length--, 0 === t.words[t.length - 1] && t.length--), t;
      }),
      r(b, c),
      r(p, c),
      r(m, c),
      (m.prototype.imulK = function (t) {
        for (var e = 0, i = 0; t.length > i; i++) {
          var r = 19 * (0 | t.words[i]) + e,
            n = 67108863 & r;
          (r >>>= 26), (t.words[i] = n), (e = r);
        }
        return 0 !== e && (t.words[t.length++] = e), t;
      }),
      (n._prime = function (t) {
        if (R[t]) return R[t];
        var e;
        if ("k256" === t) e = new l();
        else if ("p224" === t) e = new b();
        else if ("p192" === t) e = new p();
        else {
          if ("p25519" !== t) throw Error("Unknown prime " + t);
          e = new m();
        }
        return (R[t] = e), e;
      }),
      (v.prototype._verify1 = function (t) {
        i(0 === t.negative, "red works only with positives"), i(t.red, "red works only with red numbers");
      }),
      (v.prototype._verify2 = function (t, e) {
        i(0 === (t.negative | e.negative), "red works only with positives"), i(t.red && t.red === e.red, "red works only with red numbers");
      }),
      (v.prototype.imod = function (t) {
        return this.prime ? this.prime.ireduce(t)._forceRed(this) : (t.umod(this.m)._forceRed(this)._move(t), t);
      }),
      (v.prototype.neg = function (t) {
        return t.isZero() ? t.clone() : this.m.sub(t)._forceRed(this);
      }),
      (v.prototype.add = function (t, e) {
        this._verify2(t, e);
        var i = t.add(e);
        return i.cmp(this.m) >= 0 && i.isub(this.m), i._forceRed(this);
      }),
      (v.prototype.iadd = function (t, e) {
        this._verify2(t, e);
        var i = t.iadd(e);
        return i.cmp(this.m) >= 0 && i.isub(this.m), i;
      }),
      (v.prototype.sub = function (t, e) {
        this._verify2(t, e);
        var i = t.sub(e);
        return 0 > i.cmpn(0) && i.iadd(this.m), i._forceRed(this);
      }),
      (v.prototype.isub = function (t, e) {
        this._verify2(t, e);
        var i = t.isub(e);
        return 0 > i.cmpn(0) && i.iadd(this.m), i;
      }),
      (v.prototype.shl = function (t, e) {
        return this._verify1(t), this.imod(t.ushln(e));
      }),
      (v.prototype.imul = function (t, e) {
        return this._verify2(t, e), this.imod(t.imul(e));
      }),
      (v.prototype.mul = function (t, e) {
        return this._verify2(t, e), this.imod(t.mul(e));
      }),
      (v.prototype.isqr = function (t) {
        return this.imul(t, t.clone());
      }),
      (v.prototype.sqr = function (t) {
        return this.mul(t, t);
      }),
      (v.prototype.sqrt = function (t) {
        if (t.isZero()) return t.clone();
        var e = this.m.andln(3);
        if ((i(1 === e % 2), 3 === e)) {
          var r = this.m.add(new n(1)).iushrn(2);
          return this.pow(t, r);
        }
        for (var f = this.m.subn(1), a = 0; !f.isZero() && 0 === f.andln(1); ) a++, f.iushrn(1);
        i(!f.isZero());
        var h = new n(1).toRed(this),
          s = h.redNeg(),
          o = this.m.subn(1).iushrn(1),
          d = this.m.bitLength();
        for (d = new n(2 * d * d).toRed(this); 0 !== this.pow(d, o).cmp(s); ) d.redIAdd(s);
        for (var u = this.pow(d, f), c = this.pow(t, f.addn(1).iushrn(1)), l = this.pow(t, f), b = a; 0 !== l.cmp(h); ) {
          for (var p = l, m = 0; 0 !== p.cmp(h); m++) p = p.redSqr();
          i(b > m);
          var v = this.pow(u, new n(1).iushln(b - m - 1));
          (c = c.redMul(v)), (u = v.redSqr()), (l = l.redMul(u)), (b = m);
        }
        return c;
      }),
      (v.prototype.invm = function (t) {
        var e = t._invmp(this.m);
        return 0 !== e.negative ? ((e.negative = 0), this.imod(e).redNeg()) : this.imod(e);
      }),
      (v.prototype.pow = function (t, e) {
        if (e.isZero()) return new n(1).toRed(this);
        if (0 === e.cmpn(1)) return t.clone();
        var i = 4,
          r = Array(1 << i);
        (r[0] = new n(1).toRed(this)), (r[1] = t);
        for (var f = 2; r.length > f; f++) r[f] = this.mul(r[f - 1], t);
        var a = r[0],
          h = 0,
          s = 0,
          o = e.bitLength() % 26;
        for (0 === o && (o = 26), f = e.length - 1; f >= 0; f--) {
          for (var d = e.words[f], u = o - 1; u >= 0; u--) {
            var c = 1 & (d >> u);
            a !== r[0] && (a = this.sqr(a)),
              0 !== c || 0 !== h
                ? ((h <<= 1), (h |= c), s++, (s === i || (0 === f && 0 === u)) && ((a = this.mul(a, r[h])), (s = 0), (h = 0)))
                : (s = 0);
          }
          o = 26;
        }
        return a;
      }),
      (v.prototype.convertTo = function (t) {
        var e = t.umod(this.m);
        return e === t ? e.clone() : e;
      }),
      (v.prototype.convertFrom = function (t) {
        var e = t.clone();
        return (e.red = null), e;
      }),
      (n.mont = function (t) {
        return new y(t);
      }),
      r(y, v),
      (y.prototype.convertTo = function (t) {
        return this.imod(t.ushln(this.shift));
      }),
      (y.prototype.convertFrom = function (t) {
        var e = this.imod(t.mul(this.rinv));
        return (e.red = null), e;
      }),
      (y.prototype.imul = function (t, e) {
        if (t.isZero() || e.isZero()) return (t.words[0] = 0), (t.length = 1), t;
        var i = t.imul(e),
          r = i.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
          n = i.isub(r).iushrn(this.shift),
          f = n;
        return n.cmp(this.m) >= 0 ? (f = n.isub(this.m)) : 0 > n.cmpn(0) && (f = n.iadd(this.m)), f._forceRed(this);
      }),
      (y.prototype.mul = function (t, e) {
        if (t.isZero() || e.isZero()) return new n(0)._forceRed(this);
        var i = t.mul(e),
          r = i.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m),
          f = i.isub(r).iushrn(this.shift),
          a = f;
        return f.cmp(this.m) >= 0 ? (a = f.isub(this.m)) : 0 > f.cmpn(0) && (a = f.iadd(this.m)), a._forceRed(this);
      }),
      (y.prototype.invm = function (t) {
        var e = this.imod(t._invmp(this.m).mul(this.r2));
        return e._forceRed(this);
      });
  })("undefined" == typeof module || module, this),
  (function () {
    "use strict";
    function Sha256(t, e) {
      e
        ? ((blocks[0] =
            blocks[16] =
            blocks[1] =
            blocks[2] =
            blocks[3] =
            blocks[4] =
            blocks[5] =
            blocks[6] =
            blocks[7] =
            blocks[8] =
            blocks[9] =
            blocks[10] =
            blocks[11] =
            blocks[12] =
            blocks[13] =
            blocks[14] =
            blocks[15] =
              0),
          (this.blocks = blocks))
        : (this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        t
          ? ((this.h0 = 3238371032),
            (this.h1 = 914150663),
            (this.h2 = 812702999),
            (this.h3 = 4144912697),
            (this.h4 = 4290775857),
            (this.h5 = 1750603025),
            (this.h6 = 1694076839),
            (this.h7 = 3204075428))
          : ((this.h0 = 1779033703),
            (this.h1 = 3144134277),
            (this.h2 = 1013904242),
            (this.h3 = 2773480762),
            (this.h4 = 1359893119),
            (this.h5 = 2600822924),
            (this.h6 = 528734635),
            (this.h7 = 1541459225)),
        (this.block = this.start = this.bytes = this.hBytes = 0),
        (this.finalized = this.hashed = !1),
        (this.first = !0),
        (this.is224 = t);
    }
    function HmacSha256(t, e, i) {
      var r,
        n = typeof t;
      if ("string" === n) {
        var f,
          a = [],
          h = t.length,
          s = 0;
        for (r = 0; h > r; ++r)
          (f = t.charCodeAt(r)),
            128 > f
              ? (a[s++] = f)
              : 2048 > f
              ? ((a[s++] = 192 | (f >> 6)), (a[s++] = 128 | (63 & f)))
              : 55296 > f || f >= 57344
              ? ((a[s++] = 224 | (f >> 12)), (a[s++] = 128 | (63 & (f >> 6))), (a[s++] = 128 | (63 & f)))
              : ((f = 65536 + (((1023 & f) << 10) | (1023 & t.charCodeAt(++r)))),
                (a[s++] = 240 | (f >> 18)),
                (a[s++] = 128 | (63 & (f >> 12))),
                (a[s++] = 128 | (63 & (f >> 6))),
                (a[s++] = 128 | (63 & f)));
        t = a;
      } else {
        if ("object" !== n) throw Error(ERROR);
        if (null === t) throw Error(ERROR);
        if (ARRAY_BUFFER && t.constructor === ArrayBuffer) t = new Uint8Array(t);
        else if (!(Array.isArray(t) || (ARRAY_BUFFER && ArrayBuffer.isView(t)))) throw Error(ERROR);
      }
      t.length > 64 && (t = new Sha256(e, !0).update(t).array());
      var o = [],
        d = [];
      for (r = 0; 64 > r; ++r) {
        var u = t[r] || 0;
        (o[r] = 92 ^ u), (d[r] = 54 ^ u);
      }
      Sha256.call(this, e, i), this.update(d), (this.oKeyPad = o), (this.inner = !0), (this.sharedMemory = i);
    }
    var ERROR = "input is invalid type",
      WINDOW = "object" == typeof window,
      root = WINDOW ? window : {};
    root.JS_SHA256_NO_WINDOW && (WINDOW = !1);
    var WEB_WORKER = !WINDOW && "object" == typeof self,
      NODE_JS = !root.JS_SHA256_NO_NODE_JS && "object" == typeof process && process.versions && process.versions.node;
    NODE_JS ? (root = global) : WEB_WORKER && (root = self);
    var COMMON_JS = !root.JS_SHA256_NO_COMMON_JS && "object" == typeof module && module.exports,
      AMD = "function" == typeof define && define.amd,
      ARRAY_BUFFER = !root.JS_SHA256_NO_ARRAY_BUFFER && "undefined" != typeof ArrayBuffer,
      HEX_CHARS = "0123456789abcdef".split(""),
      EXTRA = [-2147483648, 8388608, 32768, 128],
      SHIFT = [24, 16, 8, 0],
      K = [
        1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
        1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
        2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
        1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
        430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
        2428436474, 2756734187, 3204031479, 3329325298,
      ],
      OUTPUT_TYPES = ["hex", "array", "digest", "arrayBuffer"],
      blocks = [];
    (root.JS_SHA256_NO_NODE_JS || !Array.isArray) &&
      (Array.isArray = function (t) {
        return "[object Array]" === Object.prototype.toString.call(t);
      }),
      !ARRAY_BUFFER ||
        (!root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW && ArrayBuffer.isView) ||
        (ArrayBuffer.isView = function (t) {
          return "object" == typeof t && t.buffer && t.buffer.constructor === ArrayBuffer;
        });
    var createOutputMethod = function (t, e) {
        return function (i) {
          return new Sha256(e, !0).update(i)[t]();
        };
      },
      createMethod = function (t) {
        var e = createOutputMethod("hex", t);
        NODE_JS && (e = nodeWrap(e, t)),
          (e.create = function () {
            return new Sha256(t);
          }),
          (e.update = function (t) {
            return e.create().update(t);
          });
        for (var i = 0; OUTPUT_TYPES.length > i; ++i) {
          var r = OUTPUT_TYPES[i];
          e[r] = createOutputMethod(r, t);
        }
        return e;
      },
      nodeWrap = function (method, is224) {
        var crypto = eval("require('crypto')"),
          Buffer = eval("require('buffer').Buffer"),
          algorithm = is224 ? "sha224" : "sha256",
          nodeMethod = function (t) {
            if ("string" == typeof t) return crypto.createHash(algorithm).update(t, "utf8").digest("hex");
            if (null === t || void 0 === t) throw Error(ERROR);
            return (
              t.constructor === ArrayBuffer && (t = new Uint8Array(t)),
              Array.isArray(t) || ArrayBuffer.isView(t) || t.constructor === Buffer
                ? crypto.createHash(algorithm).update(new Buffer(t)).digest("hex")
                : method(t)
            );
          };
        return nodeMethod;
      },
      createHmacOutputMethod = function (t, e) {
        return function (i, r) {
          return new HmacSha256(i, e, !0).update(r)[t]();
        };
      },
      createHmacMethod = function (t) {
        var e = createHmacOutputMethod("hex", t);
        (e.create = function (e) {
          return new HmacSha256(e, t);
        }),
          (e.update = function (t, i) {
            return e.create(t).update(i);
          });
        for (var i = 0; OUTPUT_TYPES.length > i; ++i) {
          var r = OUTPUT_TYPES[i];
          e[r] = createHmacOutputMethod(r, t);
        }
        return e;
      };
    (Sha256.prototype.update = function (t) {
      if (!this.finalized) {
        var e,
          i = typeof t;
        if ("string" !== i) {
          if ("object" !== i) throw Error(ERROR);
          if (null === t) throw Error(ERROR);
          if (ARRAY_BUFFER && t.constructor === ArrayBuffer) t = new Uint8Array(t);
          else if (!(Array.isArray(t) || (ARRAY_BUFFER && ArrayBuffer.isView(t)))) throw Error(ERROR);
          e = !0;
        }
        for (var r, n, f = 0, a = t.length, h = this.blocks; a > f; ) {
          if (
            (this.hashed &&
              ((this.hashed = !1),
              (h[0] = this.block),
              (h[16] = h[1] = h[2] = h[3] = h[4] = h[5] = h[6] = h[7] = h[8] = h[9] = h[10] = h[11] = h[12] = h[13] = h[14] = h[15] = 0)),
            e)
          )
            for (n = this.start; a > f && 64 > n; ++f) h[n >> 2] |= t[f] << SHIFT[3 & n++];
          else
            for (n = this.start; a > f && 64 > n; ++f)
              (r = t.charCodeAt(f)),
                128 > r
                  ? (h[n >> 2] |= r << SHIFT[3 & n++])
                  : 2048 > r
                  ? ((h[n >> 2] |= (192 | (r >> 6)) << SHIFT[3 & n++]), (h[n >> 2] |= (128 | (63 & r)) << SHIFT[3 & n++]))
                  : 55296 > r || r >= 57344
                  ? ((h[n >> 2] |= (224 | (r >> 12)) << SHIFT[3 & n++]),
                    (h[n >> 2] |= (128 | (63 & (r >> 6))) << SHIFT[3 & n++]),
                    (h[n >> 2] |= (128 | (63 & r)) << SHIFT[3 & n++]))
                  : ((r = 65536 + (((1023 & r) << 10) | (1023 & t.charCodeAt(++f)))),
                    (h[n >> 2] |= (240 | (r >> 18)) << SHIFT[3 & n++]),
                    (h[n >> 2] |= (128 | (63 & (r >> 12))) << SHIFT[3 & n++]),
                    (h[n >> 2] |= (128 | (63 & (r >> 6))) << SHIFT[3 & n++]),
                    (h[n >> 2] |= (128 | (63 & r)) << SHIFT[3 & n++]));
          (this.lastByteIndex = n),
            (this.bytes += n - this.start),
            n >= 64 ? ((this.block = h[16]), (this.start = n - 64), this.hash(), (this.hashed = !0)) : (this.start = n);
        }
        return this.bytes > 4294967295 && ((this.hBytes += (this.bytes / 4294967296) << 0), (this.bytes = this.bytes % 4294967296)), this;
      }
    }),
      (Sha256.prototype.finalize = function () {
        if (!this.finalized) {
          this.finalized = !0;
          var t = this.blocks,
            e = this.lastByteIndex;
          (t[16] = this.block),
            (t[e >> 2] |= EXTRA[3 & e]),
            (this.block = t[16]),
            e >= 56 &&
              (this.hashed || this.hash(),
              (t[0] = this.block),
              (t[16] = t[1] = t[2] = t[3] = t[4] = t[5] = t[6] = t[7] = t[8] = t[9] = t[10] = t[11] = t[12] = t[13] = t[14] = t[15] = 0)),
            (t[14] = (this.hBytes << 3) | (this.bytes >>> 29)),
            (t[15] = this.bytes << 3),
            this.hash();
        }
      }),
      (Sha256.prototype.hash = function () {
        var t,
          e,
          i,
          r,
          n,
          f,
          a,
          h,
          s,
          o,
          d,
          u = this.h0,
          c = this.h1,
          l = this.h2,
          b = this.h3,
          p = this.h4,
          m = this.h5,
          v = this.h6,
          y = this.h7,
          g = this.blocks;
        for (t = 16; 64 > t; ++t)
          (n = g[t - 15]),
            (e = ((n >>> 7) | (n << 25)) ^ ((n >>> 18) | (n << 14)) ^ (n >>> 3)),
            (n = g[t - 2]),
            (i = ((n >>> 17) | (n << 15)) ^ ((n >>> 19) | (n << 13)) ^ (n >>> 10)),
            (g[t] = (g[t - 16] + e + g[t - 7] + i) << 0);
        for (d = c & l, t = 0; 64 > t; t += 4)
          this.first
            ? (this.is224
                ? ((h = 300032), (n = g[0] - 1413257819), (y = (n - 150054599) << 0), (b = (n + 24177077) << 0))
                : ((h = 704751109), (n = g[0] - 210244248), (y = (n - 1521486534) << 0), (b = (n + 143694565) << 0)),
              (this.first = !1))
            : ((e = ((u >>> 2) | (u << 30)) ^ ((u >>> 13) | (u << 19)) ^ ((u >>> 22) | (u << 10))),
              (i = ((p >>> 6) | (p << 26)) ^ ((p >>> 11) | (p << 21)) ^ ((p >>> 25) | (p << 7))),
              (h = u & c),
              (r = h ^ (u & l) ^ d),
              (a = (p & m) ^ (~p & v)),
              (n = y + i + a + K[t] + g[t]),
              (f = e + r),
              (y = (b + n) << 0),
              (b = (n + f) << 0)),
            (e = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10))),
            (i = ((y >>> 6) | (y << 26)) ^ ((y >>> 11) | (y << 21)) ^ ((y >>> 25) | (y << 7))),
            (s = b & u),
            (r = s ^ (b & c) ^ h),
            (a = (y & p) ^ (~y & m)),
            (n = v + i + a + K[t + 1] + g[t + 1]),
            (f = e + r),
            (v = (l + n) << 0),
            (l = (n + f) << 0),
            (e = ((l >>> 2) | (l << 30)) ^ ((l >>> 13) | (l << 19)) ^ ((l >>> 22) | (l << 10))),
            (i = ((v >>> 6) | (v << 26)) ^ ((v >>> 11) | (v << 21)) ^ ((v >>> 25) | (v << 7))),
            (o = l & b),
            (r = o ^ (l & u) ^ s),
            (a = (v & y) ^ (~v & p)),
            (n = m + i + a + K[t + 2] + g[t + 2]),
            (f = e + r),
            (m = (c + n) << 0),
            (c = (n + f) << 0),
            (e = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10))),
            (i = ((m >>> 6) | (m << 26)) ^ ((m >>> 11) | (m << 21)) ^ ((m >>> 25) | (m << 7))),
            (d = c & l),
            (r = d ^ (c & b) ^ o),
            (a = (m & v) ^ (~m & y)),
            (n = p + i + a + K[t + 3] + g[t + 3]),
            (f = e + r),
            (p = (u + n) << 0),
            (u = (n + f) << 0);
        (this.h0 = (this.h0 + u) << 0),
          (this.h1 = (this.h1 + c) << 0),
          (this.h2 = (this.h2 + l) << 0),
          (this.h3 = (this.h3 + b) << 0),
          (this.h4 = (this.h4 + p) << 0),
          (this.h5 = (this.h5 + m) << 0),
          (this.h6 = (this.h6 + v) << 0),
          (this.h7 = (this.h7 + y) << 0);
      }),
      (Sha256.prototype.hex = function () {
        this.finalize();
        var t = this.h0,
          e = this.h1,
          i = this.h2,
          r = this.h3,
          n = this.h4,
          f = this.h5,
          a = this.h6,
          h = this.h7,
          s =
            HEX_CHARS[15 & (t >> 28)] +
            HEX_CHARS[15 & (t >> 24)] +
            HEX_CHARS[15 & (t >> 20)] +
            HEX_CHARS[15 & (t >> 16)] +
            HEX_CHARS[15 & (t >> 12)] +
            HEX_CHARS[15 & (t >> 8)] +
            HEX_CHARS[15 & (t >> 4)] +
            HEX_CHARS[15 & t] +
            HEX_CHARS[15 & (e >> 28)] +
            HEX_CHARS[15 & (e >> 24)] +
            HEX_CHARS[15 & (e >> 20)] +
            HEX_CHARS[15 & (e >> 16)] +
            HEX_CHARS[15 & (e >> 12)] +
            HEX_CHARS[15 & (e >> 8)] +
            HEX_CHARS[15 & (e >> 4)] +
            HEX_CHARS[15 & e] +
            HEX_CHARS[15 & (i >> 28)] +
            HEX_CHARS[15 & (i >> 24)] +
            HEX_CHARS[15 & (i >> 20)] +
            HEX_CHARS[15 & (i >> 16)] +
            HEX_CHARS[15 & (i >> 12)] +
            HEX_CHARS[15 & (i >> 8)] +
            HEX_CHARS[15 & (i >> 4)] +
            HEX_CHARS[15 & i] +
            HEX_CHARS[15 & (r >> 28)] +
            HEX_CHARS[15 & (r >> 24)] +
            HEX_CHARS[15 & (r >> 20)] +
            HEX_CHARS[15 & (r >> 16)] +
            HEX_CHARS[15 & (r >> 12)] +
            HEX_CHARS[15 & (r >> 8)] +
            HEX_CHARS[15 & (r >> 4)] +
            HEX_CHARS[15 & r] +
            HEX_CHARS[15 & (n >> 28)] +
            HEX_CHARS[15 & (n >> 24)] +
            HEX_CHARS[15 & (n >> 20)] +
            HEX_CHARS[15 & (n >> 16)] +
            HEX_CHARS[15 & (n >> 12)] +
            HEX_CHARS[15 & (n >> 8)] +
            HEX_CHARS[15 & (n >> 4)] +
            HEX_CHARS[15 & n] +
            HEX_CHARS[15 & (f >> 28)] +
            HEX_CHARS[15 & (f >> 24)] +
            HEX_CHARS[15 & (f >> 20)] +
            HEX_CHARS[15 & (f >> 16)] +
            HEX_CHARS[15 & (f >> 12)] +
            HEX_CHARS[15 & (f >> 8)] +
            HEX_CHARS[15 & (f >> 4)] +
            HEX_CHARS[15 & f] +
            HEX_CHARS[15 & (a >> 28)] +
            HEX_CHARS[15 & (a >> 24)] +
            HEX_CHARS[15 & (a >> 20)] +
            HEX_CHARS[15 & (a >> 16)] +
            HEX_CHARS[15 & (a >> 12)] +
            HEX_CHARS[15 & (a >> 8)] +
            HEX_CHARS[15 & (a >> 4)] +
            HEX_CHARS[15 & a];
        return (
          this.is224 ||
            (s +=
              HEX_CHARS[15 & (h >> 28)] +
              HEX_CHARS[15 & (h >> 24)] +
              HEX_CHARS[15 & (h >> 20)] +
              HEX_CHARS[15 & (h >> 16)] +
              HEX_CHARS[15 & (h >> 12)] +
              HEX_CHARS[15 & (h >> 8)] +
              HEX_CHARS[15 & (h >> 4)] +
              HEX_CHARS[15 & h]),
          s
        );
      }),
      (Sha256.prototype.toString = Sha256.prototype.hex),
      (Sha256.prototype.digest = function () {
        this.finalize();
        var t = this.h0,
          e = this.h1,
          i = this.h2,
          r = this.h3,
          n = this.h4,
          f = this.h5,
          a = this.h6,
          h = this.h7,
          s = [
            255 & (t >> 24),
            255 & (t >> 16),
            255 & (t >> 8),
            255 & t,
            255 & (e >> 24),
            255 & (e >> 16),
            255 & (e >> 8),
            255 & e,
            255 & (i >> 24),
            255 & (i >> 16),
            255 & (i >> 8),
            255 & i,
            255 & (r >> 24),
            255 & (r >> 16),
            255 & (r >> 8),
            255 & r,
            255 & (n >> 24),
            255 & (n >> 16),
            255 & (n >> 8),
            255 & n,
            255 & (f >> 24),
            255 & (f >> 16),
            255 & (f >> 8),
            255 & f,
            255 & (a >> 24),
            255 & (a >> 16),
            255 & (a >> 8),
            255 & a,
          ];
        return this.is224 || s.push(255 & (h >> 24), 255 & (h >> 16), 255 & (h >> 8), 255 & h), s;
      }),
      (Sha256.prototype.array = Sha256.prototype.digest),
      (Sha256.prototype.arrayBuffer = function () {
        this.finalize();
        var t = new ArrayBuffer(this.is224 ? 28 : 32),
          e = new DataView(t);
        return (
          e.setUint32(0, this.h0),
          e.setUint32(4, this.h1),
          e.setUint32(8, this.h2),
          e.setUint32(12, this.h3),
          e.setUint32(16, this.h4),
          e.setUint32(20, this.h5),
          e.setUint32(24, this.h6),
          this.is224 || e.setUint32(28, this.h7),
          t
        );
      }),
      (HmacSha256.prototype = new Sha256()),
      (HmacSha256.prototype.finalize = function () {
        if ((Sha256.prototype.finalize.call(this), this.inner)) {
          this.inner = !1;
          var t = this.array();
          Sha256.call(this, this.is224, this.sharedMemory), this.update(this.oKeyPad), this.update(t), Sha256.prototype.finalize.call(this);
        }
      });
    var exports = createMethod();
    (exports.sha256 = exports),
      (exports.sha224 = createMethod(!0)),
      (exports.sha256.hmac = createHmacMethod()),
      (exports.sha224.hmac = createHmacMethod(!0)),
      COMMON_JS
        ? (module.exports = exports)
        : ((root.sha256 = exports.sha256),
          (root.sha224 = exports.sha224),
          AMD &&
            define(function () {
              return exports;
            }));
  })();

const secp256k1 = new elliptic.ec("secp256k1");
