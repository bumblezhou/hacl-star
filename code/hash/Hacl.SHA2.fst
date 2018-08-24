module Hacl.SHA2

module U8 = FStar.UInt8
module U32 = FStar.UInt32
module U64 = FStar.UInt64
module U128 = FStar.UInt128

module Cast = FStar.Int.Cast.Full
module Constants = Spec.SHA2.Constants
module Tactics = FStar.Tactics
module Helpers = Spec.Hash.Helpers
module Endianness = FStar.Kremlin.Endianness
module Math = FStar.Math.Lemmas

module S = FStar.Seq
module B = LowStar.Buffer
module G = FStar.Ghost
module HS = FStar.HyperStack
module ST = FStar.HyperStack.ST

open Spec.Hash.Helpers
open LowStar.BufferOps

friend Spec.SHA2

#set-options "--max_fuel 0 --max_ifuel 0"

(** Top-level constant arrays for the SHA2 algorithms. *)

(* NOTE: we don't have monotonicity yet so there will be various assumes. *)
let h224 = B.gcmalloc_of_list HS.root Constants.h224_l
let h256 = B.gcmalloc_of_list HS.root Constants.h256_l
let h384 = B.gcmalloc_of_list HS.root Constants.h384_l
let h512 = B.gcmalloc_of_list HS.root Constants.h512_l

let k224_256 = B.gcmalloc_of_list HS.root Constants.k224_256_l
let k384_512 = B.gcmalloc_of_list HS.root Constants.k384_512_l

(* We believe it'll be hard to get, "for free", within this module:
     readonly h224 /\ writable client_state ==> disjoint h224 client_state
   so, instead, we require the client to do a little bit of reasoning to show
   that their buffers are disjoint from our top-level readonly state. *)

(* The total footprint of our morally readonly data. *)
let static_fp () =
  M.loc_union
    (M.loc_union (M.loc_addr_of_buffer k224_256) (M.loc_addr_of_buffer k384_512))
    (M.loc_union
      (M.loc_union (M.loc_addr_of_buffer h224) (M.loc_addr_of_buffer h256))
      (M.loc_union (M.loc_addr_of_buffer h384) (M.loc_addr_of_buffer h512)))

let loc_in (l: M.loc) (h: HS.mem) =
  M.(loc_not_unused_in h `loc_includes` l)

(* A useful lemma for clients, to be called at any time before performing an
   allocation, hence giving them "for free" that their allocation is disjoint from
   our top-level arrays. *)
val recall_static_fp: unit -> ST.Stack unit
  (requires (fun _ -> True))
  (ensures (fun h0 _ h1 ->
    M.(modifies loc_none h0 h1) /\
    static_fp () `loc_in` h1))

let recall_static_fp () =
  B.recall h224;
  B.recall h256;
  B.recall h384;
  B.recall h512;
  B.recall k224_256;
  B.recall k384_512

(* This succeeds: *)
(* let test (): ST.St unit =
  recall_static_fp ();
  let b = B.malloc HS.root 0ul 1ul in
  assert M.(loc_disjoint (loc_addr_of_buffer b) (static_fp ())) *)

(** Alloca *)

#set-options "--max_fuel 1"

let alloca a () =
  [@ inline_let ]
  let l: list (word a) = Spec.(match a with
    | SHA2_224 -> Constants.h224_l
    | SHA2_256 -> Constants.h256_l
    | SHA2_384 -> Constants.h384_l
    | SHA2_512 -> Constants.h512_l) in
  B.alloca_of_list l

#set-options "--max_fuel 0"

let alloca_224: alloca_t SHA2_224 =
  Tactics.(synth_by_tactic (specialize (alloca SHA2_224) [`%alloca]))
let alloca_256: alloca_t SHA2_256 =
  Tactics.(synth_by_tactic (specialize (alloca SHA2_256) [`%alloca]))
let alloca_384: alloca_t SHA2_384 =
  Tactics.(synth_by_tactic (specialize (alloca SHA2_384) [`%alloca]))
let alloca_512: alloca_t SHA2_512 =
  Tactics.(synth_by_tactic (specialize (alloca SHA2_512) [`%alloca]))

(** Init *)

let init a s =
  match a with
  | SHA2_224 ->
      B.recall h224;
      // waiting for monotonicity:
      let h = ST.get () in
      assume (B.as_seq h h224 == S.seq_of_list Constants.h224_l);
      B.blit h224 0ul s 0ul 8ul
  | SHA2_256 ->
      B.recall h256;
      // waiting for monotonicity:
      let h = ST.get () in
      assume (B.as_seq h h256 == S.seq_of_list Constants.h256_l);
      B.blit h256 0ul s 0ul 8ul
  | SHA2_384 ->
      B.recall h384;
      // waiting for monotonicity:
      let h = ST.get () in
      assume (B.as_seq h h384 == S.seq_of_list Constants.h384_l);
      B.blit h384 0ul s 0ul 8ul
  | SHA2_512 ->
      B.recall h512;
      // waiting for monotonicity:
      let h = ST.get () in
      assume (B.as_seq h h512 == S.seq_of_list Constants.h512_l);
      B.blit h512 0ul s 0ul 8ul

let init_224: init_t SHA2_224 =
  Tactics.(synth_by_tactic (specialize (init SHA2_224) [`%init]))
let init_256: init_t SHA2_256 =
  Tactics.(synth_by_tactic (specialize (init SHA2_256) [`%init]))
let init_384: init_t SHA2_384 =
  Tactics.(synth_by_tactic (specialize (init SHA2_384) [`%init]))
let init_512: init_t SHA2_512 =
  Tactics.(synth_by_tactic (specialize (init SHA2_512) [`%init]))

(** Three sequence lemmas required for the pre-computation of Spec.ws *)

let index_slice (#a: Type) (s: S.seq a) (j: nat) (i: nat):
  Lemma
    (requires (
      i < j /\ j <= S.length s))
    (ensures (S.index (S.slice s 0 j) i == S.index s i))
  [ SMTPat (S.index (S.slice s 0 j) i) ]
=
  ()

let init_next (#a: Type) (s: S.seq a) (f: (i:nat { i < S.length s }) -> a) (i: nat):
  Lemma
    (requires (
      i < S.length s /\
      S.equal (S.slice s 0 i) (S.init i f) /\
      S.index s i == f i))
    (ensures (S.equal (S.slice s 0 (i + 1)) (S.init (i + 1) f)))
=
  assert (forall j. j < i ==> S.index (S.slice s 0 i) j == f j);
  assert (forall j. j < i ==> S.index (S.slice s 0 (i + 1)) j == f j);
  assert (S.index (S.slice s 0 (i + 1)) i == f i)

let init_index (#a: Type) (j: nat) (f: (i:nat { i < j }) -> a) (i: nat):
  Lemma
    (requires (
      i < j))
    (ensures (S.index (S.init j f) i == f i))
  [ SMTPat (S.index (S.init j f) i) ]
=
  ()

(** Update *)

let block_w (a: sha2_alg) =
  b:B.buffer (word a) { B.length b = size_block_w }

let block_b (a: sha2_alg) =
  b:B.buffer U8.t { FStar.Mul.(B.length b = size_block_w * size_word a) }

let ws_w a = b:B.buffer (word a) { B.length b = Spec.size_k_w a }

let block_words_be (a: sha2_alg) (h: HS.mem) (b: block_b a) =
  Spec.words_from_be a size_block_w (B.as_seq h b)

val ws (a: sha2_alg) (b: block_b a) (ws: ws_w a):
  ST.Stack unit
    (requires (fun h ->
      B.live h b /\ B.live h ws /\ B.disjoint b ws))
    (ensures (fun h0 _ h1 ->
      let b = block_words_be a h0 b in
      M.(modifies (loc_buffer ws) h0 h1) /\
      B.as_seq h1 ws == S.init (Spec.size_k_w a) (Spec.ws a b)))

let index_be (a: sha2_alg) (b: B.buffer UInt8.t) (i: UInt32.t):
  ST.Stack (word a)
    (requires (fun h ->
      B.length b % size_word a = 0 /\
      B.live h b /\
      U32.v i < B.length b / size_word a))
    (ensures (fun h0 r h1 ->
       M.(modifies loc_none h0 h1) /\
       r = S.index (Spec.words_from_be a (B.length b / size_word a) (B.as_seq h0 b)) (U32.v i)))
=
  match a with
  | SHA2_224 | SHA2_256 -> C.Endianness.index_32_be b i
  | SHA2_384 | SHA2_512 -> C.Endianness.index_64_be b i

#set-options "--max_fuel 1 --z3rlimit 100"

let ws a b ws =
  let h0 = ST.get () in
  let inv h1 (i: nat): Type0 =
    let b = block_words_be a h0 b in
    i <= Spec.size_k_w a /\
    M.(modifies (loc_buffer ws) h0 h1) /\
    S.equal (S.slice (B.as_seq h1 ws) 0 i) (S.init i (Spec.ws a b))
  in
  let f (i: U32.t { U32.(0 <= v i /\ v i < Spec.size_k_w a) }):
    ST.Stack unit
      (requires (fun h -> inv h (U32.v i)))
      (ensures (fun h0 _ h1 -> U32.(inv h0 (v i) /\ inv h1 (v i + 1))))
  =
    if U32.(i <^ 16ul) then begin
      (**) let h1 = ST.get () in
      ws.(i) <- index_be a b i;
      (**) let h2 = ST.get () in
      (**) init_next (B.as_seq h2 ws) (Spec.ws a (block_words_be a h0 b)) (U32.v i)
    end else
      let h1 = ST.get () in
      let t16 = ws.(U32.sub i 16ul) in
      let t15 = ws.(U32.sub i 15ul) in
      let t7  = ws.(U32.sub i 7ul) in
      let t2  = ws.(U32.sub i 2ul) in

      // JP: TODO, understand why this is not going through.
      (**) assert (S.index (B.as_seq h1 ws) (U32.v i - 16) ==
      (**)   S.index (S.init (U32.v i) (Spec.ws a (block_words_be a h0 b))) (U32.v i - 16));
      (**) assert (t16 == Spec.ws a (block_words_be a h0 b) (U32.v i - 16));
      (**) assert (S.index (B.as_seq h1 ws) (U32.v i - 15) ==
      (**)   S.index (S.init (U32.v i) (Spec.ws a (block_words_be a h0 b))) (U32.v i - 15));
      (**) assert (t15 == Spec.ws a (block_words_be a h0 b) (U32.v i - 15));
      (**) assert (S.index (B.as_seq h1 ws) (U32.v i - 7) ==
      (**)   S.index (S.init (U32.v i) (Spec.ws a (block_words_be a h0 b))) (U32.v i - 7));
      (**) assert (t7 == Spec.ws a (block_words_be a h0 b) (U32.v i - 7));
      (**) assert (S.index (B.as_seq h1 ws) (U32.v i - 2) ==
      (**)   S.index (S.init (U32.v i) (Spec.ws a (block_words_be a h0 b))) (U32.v i - 2));
      (**) assert (t2 == Spec.ws a (block_words_be a h0 b) (U32.v i - 2));

      let s1 = Spec._sigma1 a t2 in
      let s0 = Spec._sigma0 a t15 in
      let w = Spec.word_add_mod a s1 (Spec.word_add_mod a t7 (Spec.word_add_mod a s0 t16)) in
      ws.(i) <- w;
      (**) let h2 = ST.get () in
      (**) init_next (B.as_seq h2 ws) (Spec.ws a (block_words_be a h0 b)) (U32.v i)
  in
  C.Loops.for 0ul (U32.uint_to_t (Spec.size_k_w a)) inv f

#set-options "--max_fuel 0 --z3rlimit 20"

let hash_w (a: sha2_alg) =
  b:B.buffer (word a) { B.length b = size_hash_w a }

val k0 (a: sha2_alg): ST.Stack (B.buffer (word a))
  (requires (fun _ -> True))
  (ensures (fun h0 b h1 ->
    B.length b = Spec.size_k_w a /\
    B.live h1 b /\
    M.(modifies loc_none h0 h1) /\
    B.as_seq h1 b == Spec.k0 a))
let k0 a =
  match a with
  | SHA2_224 | SHA2_256 ->
      B.recall k224_256;
      let h = ST.get () in
      assume (B.as_seq h k224_256 == S.seq_of_list Constants.k224_256_l);
      k224_256
  | SHA2_384 | SHA2_512 ->
      B.recall k384_512;
      let h = ST.get () in
      assume (B.as_seq h k384_512 == S.seq_of_list Constants.k384_512_l);
      k384_512

inline_for_extraction unfold
let add = Spec.word_add_mod

val shuffle_core (a: sha2_alg)
  (block: G.erased (block_b a))
  (hash: hash_w a)
  (ws: ws_w a)
  (t: U32.t { U32.v t < Spec.size_k_w a }):
  ST.Stack unit
    (requires (fun h ->
      let block = G.reveal block in
      let b = block_words_be a h block in
      B.live h block /\ B.live h hash /\ B.live h ws /\
      B.disjoint block hash /\ B.disjoint block ws /\ B.disjoint hash ws /\
      B.as_seq h ws == S.init (Spec.size_k_w a) (Spec.ws a b)))
    (ensures (fun h0 _ h1 ->
      let block = G.reveal block in
      let b = block_words_be a h0 block in
      M.(modifies (loc_buffer hash) h0 h1) /\
      B.as_seq h1 hash == Spec.shuffle_core a b (B.as_seq h0 hash) (U32.v t)))

#set-options "--z3rlimit 50"
let shuffle_core a block hash ws t =
  let a0 = hash.(0ul) in
  let b0 = hash.(1ul) in
  let c0 = hash.(2ul) in
  let d0 = hash.(3ul) in
  let e0 = hash.(4ul) in
  let f0 = hash.(5ul) in
  let g0 = hash.(6ul) in
  let h0 = hash.(7ul) in

  let w = ws.(t) in

  let t1 = add a h0 (add a (Spec._Sigma1 a e0) (add a (Spec._Ch a e0 f0 g0) (add a (k0 a).(t) w))) in
  let t2 = add a (Spec._Sigma0 a a0) (Spec._Maj a a0 b0 c0) in

  hash.(0ul) <- add a t1 t2;
  hash.(1ul) <- a0;
  hash.(2ul) <- b0;
  hash.(3ul) <- c0;
  hash.(4ul) <- add a d0 t1;
  hash.(5ul) <- e0;
  hash.(6ul) <- f0;
  hash.(7ul) <- g0;

  (**) let h = ST.get () in
  (**) [@inline_let]
  (**) let l = [ add a t1 t2; a0; b0; c0; add a d0 t1; e0; f0; g0 ] in
  (**) assert_norm (List.Tot.length l = 8);
  (**) S.intro_of_list #(word a) (B.as_seq h hash) l

val shuffle: a:sha2_alg -> block:G.erased (block_b a) -> hash:hash_w a -> ws:ws_w a ->
  ST.Stack unit
    (requires (fun h ->
      let block = G.reveal block in
      let b = block_words_be a h block in
      B.live h block /\ B.live h hash /\ B.live h ws /\
      B.disjoint block hash /\ B.disjoint block ws /\ B.disjoint hash ws /\
      B.as_seq h ws == S.init (Spec.size_k_w a) (Spec.ws a b)))
    (ensures (fun h0 _ h1 ->
      let block = G.reveal block in
      let b = block_words_be a h0 block in
      M.(modifies (loc_buffer hash) h0 h1 /\
      B.as_seq h1 hash == Spec.shuffle a (B.as_seq h0 hash) b)))

inline_for_extraction
let size_k_w (a: sha2_alg) = U32.uint_to_t (Spec.size_k_w a)

let shuffle a block hash ws =
  let h0 = ST.get () in
  let inv (h1: HS.mem) (i: nat) =
    let block = G.reveal block in
    let block = block_words_be a h0 block in
    M.(modifies (loc_buffer hash) h0 h1) /\
    i <= Spec.size_k_w a /\
    B.as_seq h1 hash ==
      Spec.Loops.repeat_range 0 i (Spec.shuffle_core a block) (B.as_seq h0 hash)
  in
  let f (i: U32.t { U32.(0 <= v i /\ v i < Spec.size_k_w a)}):
    ST.Stack unit
      (requires (fun h -> inv h (U32.v i)))
      (ensures (fun h0 _ h1 ->
        U32.(inv h0 (v i) /\ inv h1 (v i + 1))))
  =
    (**) let h1 = ST.get () in
    shuffle_core a block hash ws i;
    (**) let h2 = ST.get () in
    (**) let block = G.reveal block in
    (**) let block = block_words_be a h0 block in
    (**) let hash = B.as_seq h0 hash in
    (**) Spec.Loops.repeat_range_induction 0 (U32.v i + 1) (Spec.shuffle_core a block) hash
  in
  (**) Spec.Loops.repeat_range_base 0 (Spec.shuffle_core a (block_words_be a h0 (G.reveal block))) (B.as_seq h0 hash);
  C.Loops.for 0ul (size_k_w a) inv f


let zero (a: sha2_alg): word a =
  match a with
  | SHA2_224 | SHA2_256 -> 0ul
  | SHA2_384 | SHA2_512 -> 0UL

#set-options "--max_fuel 0 --max_ifuel 0 --z3rlimit 20"

let update a hash block =
  (**) ST.push_frame ();
  (**) let h0 = ST.get () in
  let hash1: hash_w a = B.alloca (zero a) 8ul in
  let computed_ws: ws_w a = B.alloca (zero a) (UInt32.uint_to_t (Spec.size_k_w a)) in
  ws a block computed_ws;
  B.blit hash 0ul hash1 0ul 8ul;
  (**) let h1 = ST.get () in
  (**) assert (S.equal (B.as_seq h1 hash1) (B.as_seq h0 hash));
  (**) assert (S.equal (B.as_seq h1 hash) (B.as_seq h0 hash));
  shuffle a (G.hide block) hash1 computed_ws;
  C.Loops.in_place_map2 hash hash1 8ul (add a);
  (**) ST.pop_frame ()

let update_224: update_t SHA2_224 =
  Tactics.(synth_by_tactic (specialize (update SHA2_224) [`%update]))
let update_256: update_t SHA2_256 =
  Tactics.(synth_by_tactic (specialize (update SHA2_256) [`%update]))
let update_384: update_t SHA2_384 =
  Tactics.(synth_by_tactic (specialize (update SHA2_384) [`%update]))
let update_512: update_t SHA2_512 =
  Tactics.(synth_by_tactic (specialize (update SHA2_512) [`%update]))

(** One lemma needed for our for loop for padding *)

let create_next (#a: Type) (s: S.seq a) (v: a) (i: nat):
  Lemma
    (requires (
      i < S.length s /\
      S.equal (S.slice s 0 i) (S.create i v) /\
      S.index s i == v))
    (ensures (S.equal (S.slice s 0 (i + 1)) (S.create (i + 1) v)))
=
  assert (forall j. j < i ==> S.index (S.slice s 0 i) j == v);
  assert (forall j. j < i ==> S.index (S.slice s 0 (i + 1)) j == v);
  assert (S.index (S.slice s 0 (i + 1)) i == v)


(** Padding *)

let size_word (a: sha2_alg): n:U32.t { U32.v n = size_word a } =
  match a with
  | SHA2_224 | SHA2_256 -> 4ul
  | SHA2_384 | SHA2_512 -> 8ul

let size_block (a: sha2_alg): n:U32.t { U32.v n = size_block a } =
  U32.(size_word a *^ 16ul)

let size_len (a: sha2_alg): n:U32.t { U32.v n = size_len_8 a } =
  match a with
  | SHA2_224 | SHA2_256 -> 8ul
  | SHA2_384 | SHA2_512 -> 16ul

#set-options "--z3rlimit 50"
val store_len: a:sha2_alg -> len:len_t a -> b:B.buffer U8.t ->
  ST.Stack unit
    (requires (fun h ->
      B.live h b /\
      B.length b = Helpers.size_len_8 a))
    (ensures (fun h0 _ h1 ->
      M.(modifies (loc_buffer b) h0 h1) /\
      B.as_seq h1 b == Endianness.n_to_be (size_len a) (len_v a len)))
let store_len a len b =
  match a with
  | SHA2_224 | SHA2_256 ->
      C.Endianness.store64_be b len;
      let h = ST.get () in
      Endianness.n_to_be_be_to_n 8ul (B.as_seq h b)
  | SHA2_384 | SHA2_512 ->
      C.Endianness.store128_be b len;
      let h = ST.get () in
      Endianness.n_to_be_be_to_n 16ul (B.as_seq h b)

#set-options "--z3rlimit 20"

let len_mod_32 (a: sha2_alg) (len: len_t a):
  Tot (n:U32.t { U32.v n = len_v a len % Helpers.size_block a })
=
  assert (size_block a <> 0ul);
  match a with
  | SHA2_224 | SHA2_256 ->
      Math.lemma_mod_lt (U64.v len) (U32.v (size_block a));
      Math.modulo_lemma (U64.v len % U32.v (size_block a)) (pow2 32);
      Cast.uint64_to_uint32 (U64.(len %^ Cast.uint32_to_uint64 (size_block a)))
  | _ ->
      // this case is more difficult because we do: (len % pow2 64) % size_block
      // and then we need to show it's equal to len % size_block
      let len = Cast.uint128_to_uint64 len in
      Math.lemma_mod_lt (U64.v len) (U32.v (size_block a));
      Math.modulo_lemma (U64.v len % U32.v (size_block a)) (pow2 32);
      Cast.uint64_to_uint32 (U64.(len %^ Cast.uint32_to_uint64 (size_block a)))

#set-options "--z3rlimit 100"

// JP: TODO: make this proof more robust with some (?) suitable lemma from FStar.Math.Lemmas
let pad0_len (a: sha2_alg) (len: len_t a):
  Tot (n:U32.t { U32.v n = pad0_length a (len_v a len) })
=
  let open U32 in
  ((size_block a +^ size_block a) -^ (size_len a +^ 1ul +^ len_mod_32 a len)) %^ size_block a

val pad (a: sha2_alg) (len: len_t a) (dst: B.buffer U8.t):
  ST.Stack unit
    (requires (fun h ->
      len_v a len < max_input8 a /\
      B.live h dst /\
      B.length dst = pad_length a (len_v a len)))
    (ensures (fun h0 _ h1 ->
      M.(modifies (loc_buffer dst) h0 h1) /\
      B.as_seq h1 dst == Spec.pad a (len_v a len)))

let pad a len dst =
  (* i) Append a single 1 bit. *)
  let dst_bit = B.sub dst 0ul 1ul in
  dst_bit.(0ul) <- 0x80uy;
  (**) let h0 = ST.get () in
  (**) assert (S.equal (S.slice (B.as_seq h0 dst) 0 1) (S.create 1 0x80uy));

  (* ii) Fill with zeroes *)
  let len_zero = pad0_len a len in
  let dst_zero = B.sub dst 1ul len_zero in
  let inv h1 (i: nat) =
    M.(modifies (loc_buffer dst_zero) h0 h1) /\
    i <= U32.v len_zero /\
    S.equal (S.slice (B.as_seq h1 dst_zero) 0 i) (S.slice (S.create (U32.v len_zero) 0uy) 0 i)
  in
  let f (i:U32.t { U32.(0 <= v i /\ v i < U32.v len_zero)}):
    ST.Stack unit
      (requires (fun h -> inv h (U32.v i)))
      (ensures (fun h0 _ h1 -> inv h0 (U32.v i) /\ inv h1 U32.(v i + 1)))
    =
    dst_zero.(i) <- 0uy;
    (**) let h' = ST.get () in
    (**) create_next (B.as_seq h' dst_zero) 0uy (U32.v i)
  in
  C.Loops.for 0ul (pad0_len a len) inv f;
  (**) let h1 = ST.get () in
  (**) assert (
  (**)   let pad0_length = pad0_length a (len_v a len) in
  (**)   S.equal (S.slice (B.as_seq h1 dst) 1 (1 + pad0_length)) (S.create pad0_length 0uy));

  (* iii) Encoded length *)
  let dst_len = B.sub dst U32.(1ul +^ len_zero) (size_len a) in
  begin match a with
  | SHA2_224 | SHA2_256 ->
      let dst_len = B.sub dst U32.(1ul +^ len_zero) 8ul in
      (**) FStar.UInt.shift_left_value_lemma #64 (U64.v len) 3;
      (**) assert (len_v a len <= pow2 61 - 1);
      (**) assert_norm FStar.Mul.((pow2 61 - 1) * 8 < pow2 64);
      (**) assert_norm (pow2 3 = 8);
      (**) assert FStar.Mul.(U64.v len * 8 < pow2 64);
      (**) assert FStar.Mul.(FStar.UInt.shift_left #64 (len_v a len) 3 < pow2 64);
      (**) assert FStar.Mul.(U64.(v (shift_left len 3ul)) = U64.v len * 8);
      store_len a U64.(shift_left len 3ul) dst_len
  | SHA2_384 | SHA2_512 ->
      let dst_len = B.sub dst U32.(1ul +^ len_zero) 16ul in
      (**) FStar.UInt.shift_left_value_lemma #128 (U128.v len) 3;
      (**) assert (len_v a len <= pow2 125 - 1);
      (**) assert_norm FStar.Mul.((pow2 125 - 1) * 8 < pow2 128);
      (**) assert_norm (pow2 3 = 8);
      (**) assert FStar.Mul.(U128.v len * 8 < pow2 128);
      (**) assert FStar.Mul.(FStar.UInt.shift_left #128 (len_v a len) 3 < pow2 128);
      (**) assert FStar.Mul.(U128.(v (shift_left len 3ul)) = U128.v len * 8);
      store_len a U128.(shift_left len 3ul) dst_len
  end;
  (**) let h2 = ST.get () in
  (**) assert (
  (**)   let pad0_length = pad0_length a (len_v a len) in
  (**)   Spec.max_input_size_len a;
  (**)   let s = B.as_seq h2 dst in
  (**)   let s1 = S.create 1 0x80uy in
  (**)   let s2 = S.create pad0_length 0uy in
  (**)   let s3 = Endianness.n_to_be (Spec.size_len_ul_8 a) FStar.Mul.(len_v a len * 8) in
  (**)   S.equal (S.slice s 0 1) s1 /\
  (**)   S.equal (S.slice s 1 (1 + pad0_length)) s2 /\
  (**)   S.equal (S.slice s (1 + pad0_length) (1 + pad0_length + size_len_8 a)) s3 /\
  (**)   S.length s = 1 + pad0_length + size_len_8 a /\
  (**)   (len_v a len + 1 + pad0_length + size_len_8 a) % Helpers.size_block a = 0 /\
  (**)   (S.length s + len_v a len) % Helpers.size_block a = 0 /\
  (**)   S.equal s (S.append s1 (S.append s2 s3)) /\
  (**)   True);
  ()

