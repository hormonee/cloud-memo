---
description: 프로젝트의 디자인, 테스트, OG 메타데이터를 통합 검증하고 리포트를 생성합니다.
---

이 워크플로우는 프로젝트의 전반적인 건강 상태를 확인하기 위해 세 가지 핵심 스킬을 순차적으로 실행합니다.

// turbo
1. Next.js 디자인 및 보안 감사 실행
   ```bash
   ./.agents/skills/check-nextjs-design/scripts/audit_nextjs.sh
   ```

// turbo
2. 프로젝트 테스트 실행 및 검증
   ```bash
   ./.agents/skills/verify-tests/scripts/run_tests.sh
   ```

// turbo
3. OG 메타데이터 및 SEO 감사 실행
   ```bash
   ./.agents/skills/check-og-metadata/scripts/audit_og.sh
   ```

4. 모든 실행 결과를 취합하여 종합적인 **프로젝트 건강 상태 리포트(Project Health Report)**를 작성하고 사용자에게 보고합니다.
   - 디자인/보안 적합성 요약
   - 테스트 통과 현황 및 실패 원인 분석
   - 페이지별 OG 메타데이터 적용 여부 및 추천 사항
