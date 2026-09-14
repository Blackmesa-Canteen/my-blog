---
title: 数理逻辑常用恒等式
slug: shu-li-luo-ji-chang-yong-heng-deng-shi
date: '2021-08-04T05:38:10.642Z'
categories:
- Learning
tags:
- Notes
cover: ./Screen Shot 2021-08-02 at 11.00.54 AM-e906389e7c78470b81249e463217348b.jpg
original_permalink: /archives/shu-li-luo-ji-chang-yong-heng-deng-shi
---

# 常用
## Absorption
- P ∧ P ≡ P
- P ∨ P ≡ P

## Commutativity
- P ∧ Q ≡ Q ∧ P
- P ∨ Q ≡ Q ∨ P

## Associativity
- P ∧ (Q ∧ R) ≡ (P ∧ Q) ∧ R
- P ∨ (Q ∨ R) ≡ (P ∨ Q) ∨ R

## Distributivity
- P ∧ (Q ∨ R) ≡ (P ∧ Q) ∨ (P ∧ R)
- P ∨ (Q ∧ R) ≡ (P ∨ Q) ∧ (P ∨ R)

## Double negation
- P ≡ ¬¬P

## De Morgan
- ¬(P ∧ Q) ≡ ¬P ∨ ¬Q
- ¬(P ∨ Q) ≡ ¬P ∧ ¬Q

## Implication
- P ⇒ Q ≡ ¬P ∨ Q

## Contraposition
- ¬P ⇒ ¬Q ≡ Q ⇒ P
- P ⇒ ¬Q ≡ Q ⇒ ¬P
- ¬P ⇒ Q ≡ ¬Q ⇒ P

## Bi implication
- P ⇔ Q ≡ (P ∧ Q) ∨ (¬P ∧ ¬Q)
- A ⇔ B ≡ (A ⇒ B) ∧ (B ⇒ A)

## 去除异或
- A ⊕ B ≡ (A ∨ B) ∧ (¬A ∨ ¬B)

# 永真式和永假式相关恒等式
**Let ⊥ be any unsatisﬁable formula(永假式) and let ⊤ be any valid formula(永真式), then:**

## Duality
- ¬⊤ ≡ ⊥
- ¬⊥ ≡ ⊤

## Negation from absurdity
- P ⇒ ⊥ ≡ ¬P

## Identity
- P ∨ ⊥ ≡ P
- P ∧ ⊤ ≡ P

## Dominance
- P ∧ ⊥ ≡ ⊥
- P ∨ ⊤ ≡ ⊤

## Contradiction
- P ∧ ¬P ≡ ⊥

## Excluded middle
- P ∨ ¬P ≡ ⊤


## 谓词逻辑
- ∃x (¬F1) ≡ ¬∀x F1  
- ∀x (¬F1) ≡ ¬∃x F1  
- ∃x (F1 ∨ F2 ) ≡ (∃x F1) ∨ (∃x F2) 
- ∀x (F1 ∧ F2 ) ≡ (∀x F1) ∧ (∀x F2)
- ∃x (F1 ⇒ F2 ) ≡ (∀x F1) ⇒ (∃x F2)

*如果G不含x*
- ∃x G ≡ G 
- ∀x G ≡ G 
- ∃x (F ∧ G) ≡ (∃x F) ∧ G 
- ∀x (F ∨ G) ≡ (∀x F) ∨ G 
- ∀x (F ⇒ G) ≡ (∃x F) ⇒ G 
- ∀x (G ⇒ F) ≡ G ⇒ (∀x F)


