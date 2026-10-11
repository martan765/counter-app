import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CounterService } from '../services/counter.service';

import { Tab2Page } from './tab2.page';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(async () => {
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue(undefined);
    vi.mocked(Preferences.remove).mockResolvedValue(undefined);

    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the average of saved counter values', async () => {
    const counterService = TestBed.inject(CounterService);

    await counterService.add({
      id: 'first',
      name: 'První',
      value: 2,
      createdAt: '2026-09-17T08:00:00.000Z',
    });
    await counterService.add({
      id: 'second',
      name: 'Druhé',
      value: 6,
      createdAt: '2026-09-17T09:00:00.000Z',
    });

    expect(component.averageValue()).toBe(4);
  });
});
