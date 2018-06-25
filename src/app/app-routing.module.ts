import { AvailableSlotsComponent } from './components/available-slots/available-slots.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { RouterModule, Routes } from '@angular/router';
import { ScheduleListComponent } from './components/schedule-list/schedule-list.component';

const routes: Routes = [
    { path: '', redirectTo: 'schedules', pathMatch: 'full' },
    { path: 'schedules', component: ScheduleListComponent },
    { path: 'manage-calendar', component: AvailableSlotsComponent },
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
    ScheduleListComponent,
    AvailableSlotsComponent,
    PageNotFoundComponent
];
