import {
  tick,
  ComponentFixture,
  fakeAsync,
  flush,
  flushMicrotasks,
  TestBed,
} from "@angular/core/testing";
import { CoursesModule } from "../courses.module";
import { DebugElement } from "@angular/core";

import { HomeComponent } from "./home.component";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { CoursesService } from "../services/courses.service";
import { HttpClient } from "@angular/common/http";
import { COURSES } from "../../../../server/db-data";
import { setupCourses } from "../common/setup-test-data";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { click } from "../common/test-utils";
import { nextTick } from "process";

describe("HomeComponent", () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let el: DebugElement;
  let coursesServiceSpy: jasmine.SpyObj<CoursesService>;

  const beginnerCourses = setupCourses().filter(
    (course) => course.category === "BEGINNER"
  );

  beforeEach(async () => {
    const CoursesServiceSpy = jasmine.createSpyObj<CoursesService>(
      "CoursesService",
      ["findAllCourses"]
    );

    await TestBed.configureTestingModule({
      imports: [CoursesModule, NoopAnimationsModule],
      providers: [
        {
          provide: CoursesService,
          useValue: CoursesServiceSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    coursesServiceSpy = TestBed.inject(
      CoursesService
    ) as jasmine.SpyObj<CoursesService>;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should display only beginner courses", () => {
    coursesServiceSpy.findAllCourses.and.returnValue(of(beginnerCourses));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css(".mat-mdc-tab"));
    expect(tabs.length).toBe(1, "Unexpected number of tabs found");
  });

  it("should display only advanced courses", () => {
    coursesServiceSpy.findAllCourses.and.returnValue(
      of(setupCourses().filter((course) => course.category === "ADVANCED"))
    );
    fixture.detectChanges();
    const tabs = el.queryAll(By.css(".mat-mdc-tab"));
    expect(tabs.length).toBe(1, "Unexpected number of tabs found");
  });

  it("should display both tabs", () => {
    coursesServiceSpy.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css(".mat-mdc-tab"));
    expect(tabs.length).toBe(2, "Unexpected number of tabs found");
  });

  it("should display advanced courses when tab clicked", (done: DoneFn) => {
    coursesServiceSpy.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css(".mat-mdc-tab"));
    click(tabs[1]);
    fixture.detectChanges();
    setTimeout(() => {
      const cardTitles = el.queryAll(By.css(".mat-mdc-card-title"));
      expect(cardTitles.length).toBeGreaterThan(0, "Angular Security Course");
      done();
    }, 500);
  });

  it("should display advanced courses when tab clicked - FakeAsync - Tick", fakeAsync(() => {
    coursesServiceSpy.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css(".mat-mdc-tab"));
    click(tabs[1]);
    fixture.detectChanges();
    tick(500); // Simulate the asynchronous time in the fakeAsync zone
    const cardTitles = el.queryAll(By.css(".mat-mdc-card-title"));
    expect(cardTitles.length).toBeGreaterThan(0, "Angular Security Course");
  }));

  it("should display advanced courses when tab clicked - FakeAsync - Flush", fakeAsync(() => {
    coursesServiceSpy.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css(".mat-mdc-tab"));
    click(tabs[1]);
    fixture.detectChanges();
    flush(); // Executes all pending asynchronous calls
    const cardTitles = el.queryAll(By.css(".mat-mdc-card-title"));
    expect(cardTitles.length).toBeGreaterThan(0, "Angular Security Course");
  }));
});
