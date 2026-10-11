import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';

type SortOption = 'newest' | 'oldest' | 'name' | 'value';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    DecimalPipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly searchTerm = signal('');
  readonly sortOption = signal<SortOption>('newest');

  readonly totalValue = computed(() =>
    this.counterService.counters().reduce((total, counter) => total + counter.value, 0),
  );

  readonly averageValue = computed(() => {
    const counters = this.counterService.counters();
    return counters.length === 0 ? 0 : this.totalValue() / counters.length;
  });

  readonly visibleCounters = computed(() => {
    const search = this.searchTerm().trim().toLocaleLowerCase();
    const counters = this.counterService
      .counters()
      .filter((counter) => counter.name.toLocaleLowerCase().includes(search));

    return [...counters].sort((first, second) =>
      this.compareCounters(first, second, this.sortOption()),
    );
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    await this.showToast('Počítadlo bylo odstraněno.');
  }

  async clear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Vymazat historii?',
      message: 'Tato akce odstraní všechna uložená počítadla.',
      buttons: [
        {
          text: 'Zrušit',
          role: 'cancel',
        },
        {
          text: 'Vymazat',
          role: 'destructive',
          handler: () => this.clearHistory(),
        },
      ],
    });

    await alert.present();
  }

  onSearch(event: CustomEvent<{ value?: string | null }>): void {
    this.searchTerm.set(event.detail.value ?? '');
  }

  onSortChange(event: CustomEvent<{ value: SortOption }>): void {
    this.sortOption.set(event.detail.value);
  }

  private async clearHistory(): Promise<void> {
    await this.counterService.clear();
    await this.showToast('Historie byla vymazána.');
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  private compareCounters(
    first: SavedCounter,
    second: SavedCounter,
    sortOption: SortOption,
  ): number {
    switch (sortOption) {
      case 'oldest':
        return first.createdAt.localeCompare(second.createdAt);
      case 'name':
        return first.name.localeCompare(second.name, 'cs');
      case 'value':
        return second.value - first.value;
      case 'newest':
      default:
        return second.createdAt.localeCompare(first.createdAt);
    }
  }
}
