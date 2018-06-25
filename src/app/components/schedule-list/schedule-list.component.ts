import * as _ from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISchedule } from './../../models/schedule';
import { Subject } from 'rxjs';
import { ScheduleService } from './../../services/schedule.service';
import { takeUntil } from 'rxjs/operators';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss']
})
export class ScheduleListComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  schedules: ISchedule[];

  filteredByDateObj: any;
  filteredByUserAndDateObj: any;

  // objects for ngbDatepicker
  ngbdpMinDate = { year: 2018, month: 6, day: 25 };
  ngbdpDate: any;

  dateStr = '';

  user_fname = '';
  user_lname = '';

  constructor(private userService: UserService, private scheduleService: ScheduleService) { }

  ngOnInit() {
    this.scheduleService.dateSrc.subscribe(newDate => {
      this.ngbdpDate = newDate;
    });

    this.userService.getUserDetails()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        this.user_fname = user[0].firstName;
        this.user_lname = user[0].lastName;
      });

    this.scheduleService.getSchedules()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(res => {
        this.schedules = res;
        this.dateChanged(this.ngbdpDate);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  deleteSchedule(evt, sched) {
    this.scheduleService.deleteBooking(sched);
  }

  dateChanged(dateObj) {
    this.scheduleService.changeDate(dateObj);
    this.dateStr = this.scheduleService.formatDateObjToString(dateObj);
    this.filteredByDateObj = this.filteredSchedByDate(this.dateStr);
    this.filteredByUserAndDateObj = this.filteredSchedByDateAndUser(this.dateStr);
  }

  // filter schedules by selected date
  filteredSchedByDate(date) {
    return _.filter(this.schedules, ['date', date]);
  }

  // filter schedules by user
  filteredSchedByDateAndUser(date) {
    return _.filter(this.schedules, { 'firstName': this.user_fname, 'lastName': this.user_lname, 'date': date });
  }

}
