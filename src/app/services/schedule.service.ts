import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Injectable } from '@angular/core';
import { ISchedule } from './../models/schedule';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private dateSubj = new BehaviorSubject<Object>({ year: 2018, month: 6, day: 25 });
  dateSrc = this.dateSubj.asObservable();

  schedulesCollection: AngularFirestoreCollection<ISchedule>;
  schedules: Observable<ISchedule[]>;
  scheduleDocument: AngularFirestoreDocument<ISchedule>;

  constructor(public fs: AngularFirestore) {
    this.schedulesCollection = fs.collection<ISchedule>('schedules');
    this.schedules = this.schedulesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as ISchedule;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getSchedules() {
    return this.schedules;
  }

  addBooking(schedule: ISchedule) {
    schedule.id = this.schedulesCollection.ref.doc().id;
    this.schedulesCollection.add(schedule);
  }

  cancelBooking(schedule: ISchedule) {
    this.scheduleDocument = this.fs.doc(`schedules/${schedule.id}`);
    this.scheduleDocument.update(schedule);
  }

  deleteBooking(schedule: ISchedule) {
    this.scheduleDocument = this.fs.doc(`schedules/${schedule.id}`);
    this.scheduleDocument.delete();
  }

  changeDate(newDate) {
    this.dateSubj.next(newDate);
  }

  // mock structure of fixed daily pitch schedules
  getDailyPitchHours() {
    return [
      { time: '08:00', status: 'available', id: '' },
      { time: '09:00', status: 'available', id: '' },
      { time: '10:00', status: 'available', id: '' },
      { time: '11:00', status: 'available', id: '' },
      { time: '12:00', status: 'available', id: '' },
      { time: '13:00', status: 'available', id: '' },
      { time: '14:00', status: 'available', id: '' },
      { time: '15:00', status: 'available', id: '' },
      { time: '16:00', status: 'available', id: '' },
      { time: '17:00', status: 'available', id: '' },
      { time: '18:00', status: 'available', id: '' },
      { time: '19:00', status: 'available', id: '' },
      { time: '20:00', status: 'available', id: '' },
      { time: '21:00', status: 'available', id: '' },
      { time: '22:00', status: 'available', id: '' }
    ];
  }

  formatDateObjToString(dateObj) {
    return dateObj.year + '-' + dateObj.month + '-' + dateObj.day;
  }
}
