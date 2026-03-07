import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  private isServerDown = new BehaviorSubject<boolean>(false);
  isServerDown$ = this.isServerDown.asObservable();

  setServerDown(isDown: boolean): void {
    this.isServerDown.next(isDown);
  }
}
