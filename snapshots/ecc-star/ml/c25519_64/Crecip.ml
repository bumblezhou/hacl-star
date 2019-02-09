
open Prims
let rec loop = (fun tmp v ctr -> (match (ctr) with
| 0 -> begin
()
end
| _37_14 -> begin
(let _37_15 = (Bignum.fsquare tmp v)
in (let _37_17 = (Bignum.fsquare v tmp)
in (loop tmp v (ctr - 1))))
end))

let crecip' = (fun output z -> (let z2 = (Bigint.create_limb Parameters.norm_length)
in (let z9 = (Bigint.create_limb Parameters.norm_length)
in (let z11 = (Bigint.create_limb Parameters.norm_length)
in (let z2_5_0 = (Bigint.create_limb Parameters.norm_length)
in (let z2_10_0 = (Bigint.create_limb Parameters.norm_length)
in (let z2_20_0 = (Bigint.create_limb Parameters.norm_length)
in (let z2_50_0 = (Bigint.create_limb Parameters.norm_length)
in (let z2_100_0 = (Bigint.create_limb Parameters.norm_length)
in (let t0 = (Bigint.create_limb Parameters.norm_length)
in (let t1 = (Bigint.create_limb Parameters.norm_length)
in (let _37_38 = (Bignum.fsquare z2 z)
in (let _37_40 = (Bignum.fsquare t1 z2)
in (let _37_42 = (Bignum.fsquare t0 t1)
in (let _37_44 = (Bignum.fmul z9 t0 z)
in (let _37_46 = (Bignum.fmul z11 z9 z2)
in (let _37_48 = (Bignum.fsquare t0 z11)
in (let _37_50 = (Bignum.fmul z2_5_0 t0 z9)
in (let _37_52 = (Bignum.fsquare t0 z2_5_0)
in (let _37_54 = (Bignum.fsquare t1 t0)
in (let _37_56 = (Bignum.fsquare t0 t1)
in (let _37_58 = (Bignum.fsquare t1 t0)
in (let _37_60 = (Bignum.fsquare t0 t1)
in (let _37_62 = (Bignum.fmul z2_10_0 t0 z2_5_0)
in (let _37_64 = (Bignum.fsquare t0 z2_10_0)
in (let _37_66 = (Bignum.fsquare t1 t0)
in (let _37_68 = (loop t0 t1 4)
in (let _37_70 = (Bignum.fmul z2_20_0 t1 z2_10_0)
in (let _37_72 = (Bignum.fsquare t0 z2_20_0)
in (let _37_74 = (Bignum.fsquare t1 t0)
in (let _37_76 = (loop t0 t1 9)
in (let _37_78 = (Bignum.fmul t0 t1 z2_20_0)
in (let _37_80 = (Bignum.fsquare t1 t0)
in (let _37_82 = (Bignum.fsquare t0 t1)
in (let _37_84 = (loop t1 t0 4)
in (let _37_86 = (Bignum.fmul z2_50_0 t0 z2_10_0)
in (let _37_88 = (Bignum.fsquare t0 z2_50_0)
in (let _37_90 = (Bignum.fsquare t1 t0)
in (let _37_92 = (loop t0 t1 24)
in (let _37_94 = (Bignum.fmul z2_100_0 t1 z2_50_0)
in (let _37_96 = (Bignum.fsquare t1 z2_100_0)
in (let _37_98 = (Bignum.fsquare t0 t1)
in (let _37_100 = (loop t1 t0 49)
in (let _37_102 = (Bignum.fmul t1 t0 z2_100_0)
in (let _37_104 = (Bignum.fsquare t0 t1)
in (let _37_106 = (Bignum.fsquare t1 t0)
in (let _37_108 = (loop t0 t1 24)
in (let _37_110 = (Bignum.fmul t0 t1 z2_50_0)
in (let _37_112 = (Bignum.fsquare t1 t0)
in (let _37_114 = (Bignum.fsquare t0 t1)
in (let _37_116 = (Bignum.fsquare t1 t0)
in (let _37_118 = (Bignum.fsquare t0 t1)
in (let _37_120 = (Bignum.fsquare t1 t0)
in (Bignum.fmul output t1 z11))))))))))))))))))))))))))))))))))))))))))))))))))))))



