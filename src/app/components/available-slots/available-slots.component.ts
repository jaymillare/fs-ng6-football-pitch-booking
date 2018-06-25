import { UserService } from './../../services/user.service';
import { ISchedule } from './../../models/schedule';
import { ScheduleService } from './../../services/schedule.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'app-available-slots',
  templateUrl: './available-slots.component.html',
  styleUrls: ['./available-slots.component.scss']
})
export class AvailableSlotsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  // objects for ngbDatepicker
  ngbdpMinDate = { year: 2018, month: 6, day: 25 };
  ngbdpDate: any;

  dateStr = '';

  user_fname = '';
  user_lname = '';
  user_email = '';
  user_isAdmin = false;
  maxBookingCnt = 3;

  schedules: ISchedule[];
  pitchHoursObj = [];

  booking: ISchedule = {
    firstName: '',
    lastName: '',
    date: '',
    time: '',
    email: '',
    id: '',
    comments: '',
    status
  };

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
        this.user_email = user[0].email;
        this.validateUserRole(user[0].role);
      });

    this.scheduleService.getSchedules()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(schedules => {
        console.log('schedules: ', schedules);
        this.schedules = schedules;
        this.dateChanged(this.ngbdpDate);
      });
  }

  // validate if user is admin
  validateUserRole(role) {
    this.user_isAdmin = role === 'admin' ? true : false;
  }

  dateChanged(dateObj) {
    this.scheduleService.changeDate(dateObj);
    this.dateStr = this.scheduleService.formatDateObjToString(dateObj);
    this.pitchHoursObj = this.scheduleService.getDailyPitchHours();
    const filterSchedObj = this.filteredSchedByDate(this.dateStr);

    // loop to reservations by date
    for (let j = 0; j < filterSchedObj.length; j++) {
      const schedHour = filterSchedObj[j].time;
      const schedId = filterSchedObj[j].id;
      const schedStat = filterSchedObj[j].status;

      // loop to daily pitch fixed operation hours
      for (let i = 0; i < this.pitchHoursObj.length; i++) {
        const pitchHour = this.pitchHoursObj[i].time;

        if (pitchHour === schedHour) {
          // set/update availability
          this.pitchHoursObj[i].status = schedStat;
          this.pitchHoursObj[i].id = schedId;
        }
      }
    }

    console.log('pitch hours availability: ', this.pitchHoursObj);
  }

  // filter schedules by selected date
  filteredSchedByDate(date) {
    return _.filter(this.schedules, ['date', date]);
  }

  // filter schedules by user
  filteredSchedByDateAndUser(date) {
    return _.filter(this.schedules, { 'firstName': this.user_fname, 'lastName': this.user_lname, 'date': date });
  }

  // filter schedules by user and status
  filteredSchedByUserAndStatus(date) {
    return _.filter(this.schedules, { 'firstName': this.user_fname, 'lastName': this.user_lname, 'status': 'reserved' });
  }

  // auto populate user details from users collection in firestore
  // selected slot time
  bookNow(time) {
    const a = confirm('Do you want to proceed?');
    if (a) {
      if (this.user_isAdmin) {
        this.proceedToBooking(time);
      } else {
        if (this.filteredSchedByUserAndStatus(this.dateStr).length < this.maxBookingCnt) {
          this.proceedToBooking(time);
        } else {
          alert('Maximum of 3 bookings per user only. Thank you.');
        }
      }

    }
  }

  proceedToBooking(time) {
    this.booking.id = '';
    this.booking.firstName = this.user_fname;
    this.booking.lastName = this.user_lname;
    this.booking.email = this.user_email;
    this.booking.date = this.dateStr;
    this.booking.time = time;
    this.booking.status = 'reserved';
    // add to firestore
    this.scheduleService.addBooking(this.booking);
  }

  cancelBooking(slot: ISchedule) {
    this.booking.firstName = '';
    this.booking.lastName = '';
    this.booking.email = '';
    this.booking.date = this.dateStr;
    this.booking.id = slot.id;
    this.booking.time = slot.time;
    this.booking.comments = 'cancelled by admin - should send notification to the user';
    this.booking.status = 'cancelled';
    // add to firestore
    this.scheduleService.cancelBooking(this.booking);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
