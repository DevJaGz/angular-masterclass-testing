import { CoursesService } from "./courses.service";
import { TestBed } from '@angular/core/testing'
import {  HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { Course } from "../model/course";
import { HttpErrorResponse } from "@angular/common/http";




describe('CoursesService', () => {

    let coursesService: CoursesService,
        httpTestingController: HttpTestingController

    // Make a custom message log prettier
    const beautifyMessage = (message: string, ) => {
        return `❌${message}❌`
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CoursesService]
        });

        coursesService = TestBed.inject(CoursesService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    it('should retrieve all courses', () => {

        coursesService.findAllCourses().subscribe({
            next: courses => {
                expect(courses).toBeTruthy('No courses returned');
                const course = courses.find(course => course.id === 12);
                expect(course).toBeTruthy('No course returned');
                expect(course.titles.description).toBe('Angular Testing Course', 'Incorrect course title');
                expect(courses.length).toBe(12, 'Incorrect number of courses');
            }
        });

        const req = httpTestingController.expectOne('/api/courses');

        expect(req.request.method).toEqual('GET', 'Incorrect HTTP method, expected GET');

        req.flush({payload: Object.values(COURSES)});
    });

    it('should find a course by id', () => {

        const courseId = 12;

        coursesService.findCourseById(courseId).subscribe({
            next: course => {
                expect(course).toBeTruthy('No course returned');
                expect(course.id).toBe(courseId, 'Incorrect course id, expected: ' + courseId);
            }
        })

        const req = httpTestingController.expectOne(`/api/courses/${courseId}`);
        expect(req.request.method).toEqual('GET', 'Incorrect HTTP method, expected GET');

        req.flush(COURSES[courseId]);
    });

    it('should save the course data', () => {
        const courseId = 12;
        const changes: Partial<Course> = {titles: {description: 'Testing Course'}};

        coursesService.saveCourse(courseId, changes).subscribe({
            next: course => {
    
                expect(course).toBeTruthy('No course returned');
                expect(course.id).toBe(courseId, 'Incorrect course id, expected: ' + courseId);

            }
        })

        const req = httpTestingController.expectOne(`/api/courses/${courseId}`);
        expect(req.request.method).toEqual('PUT', 'Incorrect HTTP method, expected PUT');

        expect(req.request.body.titles).toBeTruthy('No titles sent in request body');
        expect(req.request.body.titles.description).toEqual(changes.titles.description, 'Incorrect description sent in request body');

        req.flush({ ...COURSES[courseId], ...changes});
    });

    it('should give an error if save course fails', () => {
        const courseId = 12;
        const changes: Partial<Course> = {titles: {description: 'Testing Course'}};
        const errorMessage = 'Save course failed';
        const statusText = 'Internal Server Error';

        coursesService.saveCourse(courseId, changes).subscribe({
            next: () => fail(beautifyMessage('The save course operation should have failed but did not')),
            error: (error: HttpErrorResponse) => {
                expect(error).toBeTruthy('No error returned');
                expect(error.status).toBe(500, 'Incorrect status code returned');
                // expect(error.statusText).toBe(errorMessage, beautifyMessage(`Incorrect error message returned, get [${error.message}] but expected [${errorMessage}]`));
            },
        });

        const req = httpTestingController.expectOne(`/api/courses/${courseId}`);
        
        expect(req.request.method).toEqual('PUT', beautifyMessage('Incorrect HTTP method, expected PUT but got ' + req.request.method));

        req.flush(errorMessage, { status: 500, statusText });

    });

    it('should find a list of lessons', () => {
        const courseId = 12;
        const defaultReqParams = {
            courseId: courseId.toString(),
            filter: '',
            sortOrder: 'asc',
            pageNumber: '0',
            pageSize: '3',
        }

        coursesService.findLessons(courseId).subscribe({
            next: lessons => {
                expect(lessons).toBeTruthy(beautifyMessage('No lessons returned'));
                expect(lessons.length).toBe(3, beautifyMessage('Incorrect number of lessons returned'));
            }
        });

        const req = httpTestingController.expectOne(req => req.url === '/api/lessons');
        expect(req.request.method).toEqual(
            'GET', 
            beautifyMessage('Incorrect HTTP method, expected GET but got ' + req.request.method));

        expect(req.request.params.get('courseId')).toEqual(
            defaultReqParams.courseId, 
            beautifyMessage(`Incorrect courseId, expected ${defaultReqParams.courseId} but got ${req.request.params.get('courseId')}`));

        expect(req.request.params.get('filter')).toEqual(
            defaultReqParams.filter, 
            beautifyMessage(`Incorrect filter, expected [${defaultReqParams.filter}] but got [${req.request.params.get('filter')}]`));

        expect(req.request.params.get('sortOrder')).toEqual(
            defaultReqParams.sortOrder, 
            beautifyMessage(`Incorrect sortOrder, expected [${defaultReqParams.sortOrder}] but got [${req.request.params.get('sortOrder')}]`));

        expect(req.request.params.get('pageNumber')).toEqual(
            defaultReqParams.pageNumber, 
            beautifyMessage(`Incorrect pageNumber, expected [${defaultReqParams.pageNumber}] but got [${req.request.params.get('pageNumber')}]`));

        expect(req.request.params.get('pageSize')).toEqual(
            defaultReqParams.pageSize,
             beautifyMessage(`Incorrect pageSize, expected [${defaultReqParams.pageSize}]  but got [${req.request.params.get('pageSize')}]`));

        req.flush({payload: findLessonsForCourse(courseId).slice(0, 3)});
    });

    afterEach(() => {   
        // Avoid unexpected requests
        httpTestingController.verify();
    });
});