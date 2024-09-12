using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.AuthDTO;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/auth")]
    [ApiController]


    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly TokenService _tokenService;
        private readonly SignInManager<AppUser> _signinManager;

        public AuthController(UserManager<AppUser> userManager, TokenService tokenService, SignInManager<AppUser> signInManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signinManager = signInManager;

        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            };

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == loginDTO.Email);
            if (user == null) return Unauthorized("Invalid Email!");
            var result = await _signinManager.CheckPasswordSignInAsync(user, loginDTO.Password, false);

            if (!result.Succeeded) return Unauthorized("Email not found and/or password incorrect");
            var roles = await _userManager.GetRolesAsync(user);



            return Ok(
                new NewUserDTO
                {
                    Username = user.UserName,
                    Email = user.Email,
                    Token = _tokenService.CreateToken(user),
                    UserId = user.Id,
                    Roles = roles
                }
            );


        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDTO)
        {
            try
            {

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var checkEmailDuplicate = await _userManager.FindByEmailAsync(registerDTO.Email);

                if (checkEmailDuplicate != null)
                {
                    return StatusCode(500, "Email already exists!!");

                }

                var appUser = new AppUser
                {
                    UserName = registerDTO.Username,
                    Email = registerDTO.Email,
                    ProfilePic = registerDTO.ProfilePic,
                    CoverPic = registerDTO.CoverPic,

                };
                var createdUser = await _userManager.CreateAsync(appUser, registerDTO.Password);

                if (createdUser.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(appUser, registerDTO.Role);
                    if (roleResult.Succeeded)
                    {
                        return Ok(
                            new NewUserDTO
                            {
                                Username = appUser.UserName,
                                Email = appUser.Email,
                            }
                        );
                    }
                    else
                    {
                        return StatusCode(500, roleResult.Errors);
                    }
                }
                else
                {
                    return StatusCode(500, createdUser.Errors);
                }
            }
            catch (Exception e)
            {

                return StatusCode(500, e);
            }
        }

        [Authorize]
        [HttpGet("verify-token")]
        public async Task<IActionResult> VerifyToken()
        {


            var allUser = await _userManager.Users.ToListAsync();
            if (allUser == null)
            {
                return NotFound();

            }

            return Ok(allUser);
        }

        [HttpGet("{Id}")]
        public async Task<IActionResult> GetUserInfroFromUid([FromRoute] string Id)
        {

            try
            {

                var getUser = await _userManager.FindByIdAsync(Id);
                if (getUser == null)
                {
                    return NotFound();
                }


                var images = new AdminImageDto
                {
                    ProfilePic = getUser.ProfilePic,
                    CoverPic = getUser.CoverPic
                };
                return StatusCode(200, images);
            }
            catch (Exception error)
            {

                return StatusCode(500, error);
            }

        }

        [HttpPut("update-images/{AdminId}")]
        public async Task<IActionResult> UpdateImagesOfAdmin(string AdminId, [FromBody] AdminImageDto adminImageDto)
        {
            var findAdminProfile = await _userManager.FindByIdAsync(AdminId);
            if (findAdminProfile == null)
            {
                return NotFound();
            }

            findAdminProfile.ProfilePic = adminImageDto.ProfilePic;
            findAdminProfile.CoverPic = adminImageDto.CoverPic;

            var result = await _userManager.UpdateAsync(findAdminProfile);

            if (result.Succeeded)
            {
                return Ok(new { Message = "Admin images updated successfully." });
            }

            return StatusCode(500, result.Errors);
        }

        // Update Admin Info
        [HttpPut("update-info/{id}")]
        public async Task<IActionResult> UpdateAdminInfo(string id, [FromBody] UpdateAdmin update)
        {
            var findAdminProfile = await _userManager.FindByIdAsync(id);
            if (findAdminProfile == null)
            {
                return NotFound();
            }

            findAdminProfile.UserName = update.Username;
            findAdminProfile.Email = update.Email;

            var result = await _userManager.UpdateAsync(findAdminProfile);

            if (result.Succeeded)
            {
                return Ok(new { Message = "Admin info updated successfully." });
            }

            return StatusCode(500, result.Errors);
        }
    }
}