// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { ComposerPlusMenu } from '../../src/components/ComposerPlusMenu';
import { I18nProvider } from '../../src/i18n';
import type { Locale } from '../../src/i18n/types';

afterEach(() => {
  cleanup();
});

function renderMenu(
  overrides: Partial<ComponentProps<typeof ComposerPlusMenu>> = {},
) {
  const props: ComponentProps<typeof ComposerPlusMenu> = {
    connectors: [],
    onPickConnector: vi.fn(),
    plugins: [],
    onPickPlugin: vi.fn(),
    mcpServers: [],
    onPickMcp: vi.fn(),
    onAttachFiles: vi.fn(),
    triggerTestId: 'plus-trigger',
    ...overrides,
  };
  return render(
    <I18nProvider initial={'en' as Locale}>
      <ComposerPlusMenu {...props} />
    </I18nProvider>,
  );
}

describe('ComposerPlusMenu basic functionality', () => {
  it('opens the menu and triggers file attachment', () => {
    const onAttachFiles = vi.fn();
    renderMenu({ onAttachFiles });
    fireEvent.click(screen.getByTestId('plus-trigger'));

    const attachButton = screen.getByRole('menuitem', { name: /Attach files/i });
    expect(attachButton).toBeTruthy();
    fireEvent.click(attachButton);
    expect(onAttachFiles).toHaveBeenCalledTimes(1);
  });

  it('can open downward for the home surface even when there is enough room above', () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 720 });

    try {
      renderMenu({ placementPreference: 'down' });
      const trigger = screen.getByTestId('plus-trigger') as HTMLButtonElement;
      trigger.getBoundingClientRect = () =>
        ({
          x: 280,
          y: 320,
          top: 320,
          left: 280,
          right: 312,
          bottom: 352,
          width: 32,
          height: 32,
          toJSON: () => ({}),
        }) as DOMRect;

      fireEvent.click(trigger);

      const menu = screen.getByRole('menu');
      expect(menu.style.top).toBe('360px');
      expect(menu.style.bottom).toBe('auto');
      expect(menu.style.width).toBe('208px');
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
    }
  });
});
