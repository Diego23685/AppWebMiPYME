using System.Security.Claims;
using BusinessPlanSimulator.Application.DTOs.Courses;
using BusinessPlanSimulator.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlanSimulator.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
    {
        try
        {
            var result = await _courseService.CreateCourseAsync(GetUserId(), dto);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("teaching")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetTeachingCourses()
    {
        var result = await _courseService.GetCoursesByTeacherAsync(GetUserId());
        return Ok(result);
    }

    [HttpGet("enrolled")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetEnrolledCourses()
    {
        var result = await _courseService.GetCoursesByStudentAsync(GetUserId());
        return Ok(result);
    }

    [HttpPost("{courseId}/enroll")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> EnrollStudent(Guid courseId, [FromBody] EnrollStudentDto dto)
    {
        try
        {
            await _courseService.EnrollStudentAsync(courseId, GetUserId(), dto);
            return Ok(new { message = "Estudiante matriculado con éxito." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{courseId}/students")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> GetEnrolledStudents(Guid courseId)
    {
        try
        {
            var result = await _courseService.GetEnrolledStudentsAsync(courseId, GetUserId());
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{courseId}")]
    [Authorize(Roles = "Teacher,Admin")]
    public async Task<IActionResult> DeleteCourse(Guid courseId)
    {
        try
        {
            await _courseService.DeleteCourseAsync(courseId, GetUserId());
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}