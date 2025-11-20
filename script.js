document.addEventListener('DOMContentLoaded', () => {
    // 키 요소 찾기 및 매핑 초기화
    const keyElements = Array.from(document.querySelectorAll('.grid-bg > div.absolute'));
    const keyMap = {}; // code -> element
    const elementMap = new Map(); // element -> { code, initialX, initialY, currentX, currentY }

    // 텍스트 기반 키 코드 매핑
    const textToCode = {
        'LShift': 'ShiftLeft',
        'RShift': 'ShiftRight',
        'Z': 'KeyZ',
        'X': 'KeyX',
        '.': 'Period',
        '/': 'Slash'
    };

    keyElements.forEach(el => {
        const text = el.textContent.trim();
        const code = textToCode[text];
        
        if (code) {
            keyMap[code] = el;
            
            // 초기 상태 저장
            elementMap.set(el, {
                code: code,
                offsetX: 0,
                offsetY: 0
            });

            // 커서 스타일 변경 (드래그 가능함을 표시)
            el.style.cursor = 'move';
        }
    });

    //  드래그 앤 드롭 (Drag & Drop)
    let isDragging = false;
    let currentDragEl = null;
    let startMouseX = 0;
    let startMouseY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    keyElements.forEach(el => {
        el.addEventListener('mousedown', (e) => {
            e.preventDefault(); // 텍스트 선택 방지
            isDragging = true;
            currentDragEl = el;
            startMouseX = e.clientX;
            startMouseY = e.clientY;
            
            const state = elementMap.get(el);
            startOffsetX = state.offsetX;
            startOffsetY = state.offsetY;

            el.style.zIndex = '100'; // 드래그 중인 요소를 최상위로
        });
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !currentDragEl) return;

        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;

        const state = elementMap.get(currentDragEl);
        
        // 그리드 스냅 (5px 단위)
        const snap = 5;
        let newOffsetX = startOffsetX + dx;
        let newOffsetY = startOffsetY + dy;
        
        newOffsetX = Math.round(newOffsetX / snap) * snap;
        newOffsetY = Math.round(newOffsetY / snap) * snap;

        // 상태 업데이트
        state.offsetX = newOffsetX;
        state.offsetY = newOffsetY;

        // CSS 변수 업데이트로 위치 이동
        currentDragEl.style.setProperty('--key-offset-x', `${newOffsetX}px`);
        currentDragEl.style.setProperty('--key-offset-y', `${newOffsetY}px`);
    });

    window.addEventListener('mouseup', () => {
        if (currentDragEl) {
            currentDragEl.style.zIndex = ''; // z-index 복구
        }
        isDragging = false;
        currentDragEl = null;
    });

    // 반응형 스케일링 (Responsive Scaling)
    const root = document.getElementById('root');
    const container = root.parentElement;
    const baseWidth = 896; // max-w-4xl (56rem * 16px)

    const updateScale = () => {
        const parentWidth = container.clientWidth;
        const scale = Math.min(1, parentWidth / baseWidth);
        
        if (scale < 1) {
            root.style.transformOrigin = 'top center';
            root.style.transform = `scale(${scale})`;
        } else {
            root.style.transform = '';
            root.style.removeProperty('--tw-scale-x');
            root.style.removeProperty('--tw-scale-y');
        }
    };

    window.addEventListener('resize', updateScale);
    // 초기 실행 및 이미지 로드 등 레이아웃 안정화 후 실행
    updateScale();
    setTimeout(updateScale, 100);
});