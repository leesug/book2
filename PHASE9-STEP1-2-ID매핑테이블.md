# Phase 9 Step 1-2: ID 매핑 테이블

**생성 시간**: 2025. 10. 5. 오전 1:10:38  
**총 챕터 수**: 139개

---

## 📊 매핑 통계 및 샘플

```javascript
bookInfo → index-0
prologue → index-1
prologue-p1 → index-1-1
part1 → index-2
part1-1-1 → index-2-1
part1-1-1-1-1-1 → index-2-1-1
```

---

## 📋 전체 매핑 테이블

| # | 기존 ID | → | 새 ID |
|---|---------|---|-------|
| 1 | `bookInfo` | → | `index-0` |
| 2 | `epilogue` | → | `index-7` |
| 3 | `epilogue-e1` | → | `index-7-1` |
| 4 | `epilogue-e2` | → | `index-7-2` |
| 5 | `epilogue-e3` | → | `index-7-3` |
| 6 | `epilogue-e4` | → | `index-7-4` |
| 7 | `part1` | → | `index-2` |
| 8 | `part1-1-1` | → | `index-2-1` |
| 9 | `part1-1-1-1-1-1` | → | `index-2-1-1` |
| 10 | `part1-1-1-1-1-2` | → | `index-2-1-2` |
| 11 | `part1-1-1-1-1-3` | → | `index-2-1-3` |
| 12 | `part1-1-1-1-1-4` | → | `index-2-1-4` |
| 13 | `part1-1-1-1-1-5` | → | `index-2-1-5` |
| 14 | `part1-1-1-1-1-6` | → | `index-2-1-6` |
| 15 | `part1-1-2` | → | `index-2-2` |
| 16 | `part1-1-2-1-2-1` | → | `index-2-2-1` |
| 17 | `part1-1-2-1-2-2` | → | `index-2-2-2` |
| 18 | `part1-1-2-1-2-3` | → | `index-2-2-3` |
| 19 | `part1-1-3` | → | `index-2-3` |
| 20 | `part1-1-3-1-3-1` | → | `index-2-3-1` |
| 21 | `part1-1-3-1-3-2` | → | `index-2-3-2` |
| 22 | `part1-1-4` | → | `index-2-4` |
| 23 | `part1-1-4-1-4-1` | → | `index-2-4-1` |
| 24 | `part1-1-4-1-4-2` | → | `index-2-4-2` |
| 25 | `part1-1-4-1-4-3` | → | `index-2-4-3` |
| 26 | `part1-1-5` | → | `index-2-5` |
| 27 | `part2` | → | `index-3` |
| 28 | `part2-2-1` | → | `index-3-1` |
| 29 | `part2-2-1-2-1-1` | → | `index-3-1-1` |
| 30 | `part2-2-1-2-1-2` | → | `index-3-1-2` |
| 31 | `part2-2-1-2-1-3` | → | `index-3-1-3` |
| 32 | `part2-2-2` | → | `index-3-2` |
| 33 | `part2-2-2-2-2-1` | → | `index-3-2-1` |
| 34 | `part2-2-2-2-2-2` | → | `index-3-2-2` |
| 35 | `part2-2-2-2-2-3` | → | `index-3-2-3` |
| 36 | `part2-2-2-2-2-4` | → | `index-3-2-4` |
| 37 | `part2-2-2-2-2-5` | → | `index-3-2-5` |
| 38 | `part2-2-3` | → | `index-3-3` |
| 39 | `part2-2-3-2-3-1` | → | `index-3-3-1` |
| 40 | `part2-2-4` | → | `index-3-4` |
| 41 | `part2-2-4-2-4-1` | → | `index-3-4-1` |
| 42 | `part2-2-4-2-4-2` | → | `index-3-4-2` |
| 43 | `part2-2-5` | → | `index-3-5` |
| 44 | `part2-2-5-2-5-1` | → | `index-3-5-1` |
| 45 | `part2-2-6` | → | `index-3-6` |
| 46 | `part2-2-6-2-6-1` | → | `index-3-6-1` |
| 47 | `part2-2-6-2-6-2` | → | `index-3-6-2` |
| 48 | `part2-2-6-2-6-3` | → | `index-3-6-3` |
| 49 | `part2-2-7` | → | `index-3-7` |
| 50 | `part2-2-7-2-7-1` | → | `index-3-7-1` |
| 51 | `part2-2-7-2-7-2` | → | `index-3-7-2` |
| 52 | `part3` | → | `index-4` |
| 53 | `part3-3-1` | → | `index-4-1` |
| 54 | `part3-3-1-3-1-1` | → | `index-4-1-1` |
| 55 | `part3-3-1-3-1-2` | → | `index-4-1-2` |
| 56 | `part3-3-1-3-1-3` | → | `index-4-1-3` |
| 57 | `part3-3-2` | → | `index-4-2` |
| 58 | `part3-3-2-3-2-1` | → | `index-4-2-1` |
| 59 | `part3-3-2-3-2-2` | → | `index-4-2-2` |
| 60 | `part3-3-2-3-2-3` | → | `index-4-2-3` |
| 61 | `part3-3-2-3-2-4` | → | `index-4-2-4` |
| 62 | `part3-3-2-3-2-5` | → | `index-4-2-5` |
| 63 | `part3-3-3` | → | `index-4-3` |
| 64 | `part3-3-3-3-3-1` | → | `index-4-3-1` |
| 65 | `part3-3-3-3-3-2` | → | `index-4-3-2` |
| 66 | `part3-3-3-3-3-3` | → | `index-4-3-3` |
| 67 | `part4` | → | `index-5` |
| 68 | `part4-4-1` | → | `index-5-1` |
| 69 | `part4-4-1-4-1-1` | → | `index-5-1-1` |
| 70 | `part4-4-1-4-1-2` | → | `index-5-1-2` |
| 71 | `part4-4-1-4-1-3` | → | `index-5-1-3` |
| 72 | `part4-4-1-4-1-4` | → | `index-5-1-4` |
| 73 | `part4-4-1-4-1-5` | → | `index-5-1-5` |
| 74 | `part4-4-1-4-1-6` | → | `index-5-1-6` |
| 75 | `part4-4-2` | → | `index-5-2` |
| 76 | `part4-4-2-4-2-1` | → | `index-5-2-1` |
| 77 | `part4-4-2-4-2-2` | → | `index-5-2-2` |
| 78 | `part4-4-2-4-2-3` | → | `index-5-2-3` |
| 79 | `part4-4-3` | → | `index-5-3` |
| 80 | `part4-4-3-4-3-1` | → | `index-5-3-1` |
| 81 | `part4-4-3-4-3-2` | → | `index-5-3-2` |
| 82 | `part4-4-3-4-3-3` | → | `index-5-3-3` |
| 83 | `part4-4-4` | → | `index-5-4` |
| 84 | `part4-4-4-4-4-1` | → | `index-5-4-1` |
| 85 | `part4-4-4-4-4-2` | → | `index-5-4-2` |
| 86 | `part4-4-4-4-4-3` | → | `index-5-4-3` |
| 87 | `part4-4-4-4-4-4` | → | `index-5-4-4` |
| 88 | `part5` | → | `index-6` |
| 89 | `part5-5-1` | → | `index-6-1` |
| 90 | `part5-5-1-5-1-1` | → | `index-6-1-1` |
| 91 | `part5-5-1-5-1-2` | → | `index-6-1-2` |
| 92 | `part5-5-1-5-1-3` | → | `index-6-1-3` |
| 93 | `part5-5-2` | → | `index-6-2` |
| 94 | `part5-5-2-5-2-1` | → | `index-6-2-1` |
| 95 | `part5-5-2-5-2-2` | → | `index-6-2-2` |
| 96 | `part5-5-2-5-2-3` | → | `index-6-2-3` |
| 97 | `part5-5-2-5-2-4` | → | `index-6-2-4` |
| 98 | `part5-5-3` | → | `index-6-3` |
| 99 | `part5-5-3-5-3-1` | → | `index-6-3-1` |
| 100 | `part5-5-3-5-3-2` | → | `index-6-3-2` |
| 101 | `part5-5-3-5-3-3` | → | `index-6-3-3` |
| 102 | `part5-5-4` | → | `index-6-4` |
| 103 | `part5-5-4-5-4-1` | → | `index-6-4-1` |
| 104 | `part5-5-4-5-4-2` | → | `index-6-4-2` |
| 105 | `part5-5-4-5-4-3` | → | `index-6-4-3` |
| 106 | `part5-5-4-5-4-4` | → | `index-6-4-4` |
| 107 | `prologue` | → | `index-1` |
| 108 | `prologue-p1` | → | `index-1-1` |
| 109 | `prologue-p10` | → | `index-1-10` |
| 110 | `prologue-p11` | → | `index-1-11` |
| 111 | `prologue-p12` | → | `index-1-12` |
| 112 | `prologue-p13` | → | `index-1-13` |
| 113 | `prologue-p14` | → | `index-1-14` |
| 114 | `prologue-p15` | → | `index-1-15` |
| 115 | `prologue-p16` | → | `index-1-16` |
| 116 | `prologue-p17` | → | `index-1-17` |
| 117 | `prologue-p18` | → | `index-1-18` |
| 118 | `prologue-p19` | → | `index-1-19` |
| 119 | `prologue-p2` | → | `index-1-2` |
| 120 | `prologue-p20` | → | `index-1-20` |
| 121 | `prologue-p21` | → | `index-1-21` |
| 122 | `prologue-p22` | → | `index-1-22` |
| 123 | `prologue-p23` | → | `index-1-23` |
| 124 | `prologue-p24` | → | `index-1-24` |
| 125 | `prologue-p25` | → | `index-1-25` |
| 126 | `prologue-p26` | → | `index-1-26` |
| 127 | `prologue-p27` | → | `index-1-27` |
| 128 | `prologue-p28` | → | `index-1-28` |
| 129 | `prologue-p29` | → | `index-1-29` |
| 130 | `prologue-p3` | → | `index-1-3` |
| 131 | `prologue-p30` | → | `index-1-30` |
| 132 | `prologue-p31` | → | `index-1-31` |
| 133 | `prologue-p32` | → | `index-1-32` |
| 134 | `prologue-p4` | → | `index-1-4` |
| 135 | `prologue-p5` | → | `index-1-5` |
| 136 | `prologue-p6` | → | `index-1-6` |
| 137 | `prologue-p7` | → | `index-1-7` |
| 138 | `prologue-p8` | → | `index-1-8` |
| 139 | `prologue-p9` | → | `index-1-9` |
