// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GymToken is ERC20, Ownable, ReentrancyGuard {
    // Workout tracking
    mapping(address => uint256) public lastWorkoutTime;
    mapping(address => uint256) public workoutStreak;
    mapping(address => uint256) public totalWorkouts;
    mapping(address => uint256) public pendingRewards;
    
    // Reward rates (tokens per workout)
    uint256 public baseRewardRate = 10 * 10**18; // 10 GYM tokens
    uint256 public streakMultiplier = 2; // 2x multiplier for streaks
    uint256 public constant MAX_STREAK_BONUS = 5; // Max 5x multiplier
    
    // Events
    event WorkoutRecorded(address indexed user, uint256 intensity, uint256 duration, uint256 reward);
    event RewardsClaimed(address indexed user, uint256 amount);
    event StreakUpdated(address indexed user, uint256 newStreak);
    
    constructor() ERC20("Gym Token", "GYM") {
        // Mint initial supply to contract owner
        _mint(msg.sender, 1000000 * 10**18); // 1M GYM tokens
    }
    
    function recordWorkout(uint256 intensity, uint256 duration) external nonReentrant {
        require(intensity >= 1 && intensity <= 10, "Invalid intensity");
        require(duration >= 5 && duration <= 300, "Invalid duration");
        
        address user = msg.sender;
        uint256 currentTime = block.timestamp;
        
        // Update streak
        if (lastWorkoutTime[user] > 0) {
            uint256 timeSinceLastWorkout = currentTime - lastWorkoutTime[user];
            if (timeSinceLastWorkout <= 2 days) {
                workoutStreak[user]++;
            } else {
                workoutStreak[user] = 1;
            }
        } else {
            workoutStreak[user] = 1;
        }
        
        lastWorkoutTime[user] = currentTime;
        totalWorkouts[user]++;
        
        // Calculate rewards
        uint256 baseReward = (baseRewardRate * intensity * duration) / 100;
        uint256 streakBonus = workoutStreak[user] > MAX_STREAK_BONUS ? MAX_STREAK_BONUS : workoutStreak[user];
        uint256 totalReward = baseReward + (baseReward * streakBonus * streakMultiplier / 10);
        
        pendingRewards[user] += totalReward;
        
        emit WorkoutRecorded(user, intensity, duration, totalReward);
        emit StreakUpdated(user, workoutStreak[user]);
    }
    
    function claimRewards() external nonReentrant {
        address user = msg.sender;
        uint256 rewards = pendingRewards[user];
        require(rewards > 0, "No rewards to claim");
        
        pendingRewards[user] = 0;
        _mint(user, rewards);
        
        emit RewardsClaimed(user, rewards);
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        return pendingRewards[user];
    }
    
    function getWorkoutStreak(address user) external view returns (uint256) {
        return workoutStreak[user];
    }
    
    function getTotalWorkouts(address user) external view returns (uint256) {
        return totalWorkouts[user];
    }
    
    function getLastWorkoutTime(address user) external view returns (uint256) {
        return lastWorkoutTime[user];
    }
    
    // Admin functions
    function setBaseRewardRate(uint256 newRate) external onlyOwner {
        baseRewardRate = newRate;
    }
    
    function setStreakMultiplier(uint256 newMultiplier) external onlyOwner {
        streakMultiplier = newMultiplier;
    }
}
