import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Calendar, Sparkles, Heart, Shield, Stethoscope, ChevronRight, Trophy, BadgeCheck, Plus, Activity } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useUser } from "@clerk/nextjs";
import MovingBar from './MovingBar';
import AnimatedPinDemo from '@/components/3d-pin-demo';

// Create motion button component
const MotionButton = motion(Button);

// Enhanced Health Challenge Game Component
const HealthGame = () => {
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [streak, setStreak] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  // Health quiz questions with improved options and explanations
  const questions = [
    {
      question: "How many glasses of water should you drink daily?",
      options: ["2-3 glasses", "4-5 glasses", "8-10 glasses", "15+ glasses"],
      correctAnswer: 2,
      explanation: "It's recommended to drink 8-10 glasses of water daily for optimal hydration and bodily functions.",
      image: "💧"
    },
    {
      question: "Which activity best promotes heart health?",
      options: ["Watching TV", "Walking 30 minutes daily", "Scrolling social media", "Eating processed foods"],
      correctAnswer: 1,
      explanation: "Regular physical activity like walking strengthens your heart, improves circulation, and reduces health risks.",
      image: "❤️"
    },
    {
      question: "Which food is highest in protein?",
      options: ["White bread", "Apple", "Chicken breast", "Candy"],
      correctAnswer: 2,
      explanation: "Chicken breast is an excellent source of lean protein with about 31g of protein per 100g serving.",
      image: "🍗"
    },
    {
      question: "What is a normal resting heart rate for adults?",
      options: ["40-50 bpm", "60-100 bpm", "120-140 bpm", "150+ bpm"],
      correctAnswer: 1,
      explanation: "A normal resting heart rate for adults ranges from 60 to 100 beats per minute, indicating good cardiovascular health.",
      image: "💓"
    },
    {
      question: "Which activity supports mental health?",
      options: ["Social isolation", "Mindful meditation", "Overworking", "Sleep deprivation"],
      correctAnswer: 1,
      explanation: "Meditation reduces stress and anxiety while improving emotional well-being and mental clarity.",
      image: "🧠"
    }
  ];

  // Start the game and timer
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentQuestion(0);
    setTimeLeft(15);
    setStreak(0);
    setGameCompleted(false);
    setFeedbackMessage("");
    setShowFeedback(false);
    
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle timeout when timer reaches zero
  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // If no answer selected, show the correct one
    if (selectedAnswer === null) {
      setStreak(0); // Reset streak on timeout
      setShowFeedback(true);
      setFeedbackMessage(`Time's up! The correct answer was: ${questions[currentQuestion].options[questions[currentQuestion].correctAnswer]}`);
      
      // Short delay before moving to next question
      setTimeout(() => {
        setShowFeedback(false);
        moveToNextQuestion();
      }, 2000);
    }
  };

  // Move to the next question or end game
  const moveToNextQuestion = () => {
    setSelectedAnswer(null);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(15);
      
      // Restart timer for next question
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Game completed
      setGameCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    // Check if answer is correct
    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setShowFeedback(true);
      setFeedbackMessage(questions[currentQuestion].explanation);
      
      // Show toast with animation for correct answer
      toast({
        title: "Correct! 🎉",
        description: `${streak + 1} in a row!`,
      });
    } else {
      setStreak(0); // Reset streak on wrong answer
      setShowFeedback(true);
      setFeedbackMessage(questions[currentQuestion].explanation);
      
      toast({
        title: "Not quite right",
        description: "Keep learning!",
        variant: "destructive",
      });
    }
    
    // Pause 2 seconds before moving to next question
    setTimeout(() => {
      setShowFeedback(false);
      moveToNextQuestion();
    }, 2000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Display game completion screen
  if (gameCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "";
    let emoji = "";
    
    if (percentage >= 80) {
      message = "Excellent! You're a health expert!";
      emoji = "🏆";
    } else if (percentage >= 60) {
      message = "Good job! You know your health facts!";
      emoji = "🌟";
    } else if (percentage >= 40) {
      message = "Not bad! Keep learning about health!";
      emoji = "📚";
    } else {
      message = "You might want to brush up on your health knowledge.";
      emoji = "💪";
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg mx-auto overflow-hidden border border-primary/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.3
                }
              }
            }}
          >
            <div className="mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                {emoji}
              </motion.div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              <motion.h3
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
              >
                Quiz Complete!
              </motion.h3>
            </h3>
            
            <motion.div
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
            >
              <p className="text-lg font-semibold mb-1">Your Score: {score}/{questions.length}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-primary h-2.5 rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
              <p className="mb-4">{message}</p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 }
                }}
              >
                <Button 
                  variant="outline" 
                  onClick={startGame}
                  className="flex-1 hover:bg-primary/10"
                >
                  Play Again
                </Button>
                <Button 
                  className="flex-1 gradient-bg" 
                  asChild
                >
                  <Link href="/app/patient">
                    Go to Dashboard <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Game welcome screen
  if (!gameStarted) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg mx-auto border border-primary/20">
        <div className="text-center">
          <div className="mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="h-16 w-16 rounded-full gradient-bg mx-auto flex items-center justify-center">
                <motion.div whileHover={{ rotate: 10, scale: 1.05 }}>
                  <Heart className="h-8 w-8 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <div className="text-2xl font-bold mb-2">
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Health IQ Challenge
            </motion.h3>
          </div>
          
          <div className="mb-6 text-gray-600 dark:text-gray-300">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Test your knowledge of health facts with this quick quiz! Learn while having fun.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MotionButton 
              onClick={startGame} 
              className="gradient-bg px-8 py-2" 
              size="lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Challenge
            </MotionButton>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active game screen
  return (
    <AnimatePresence mode="wait">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg mx-auto border border-primary/20">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          {/* Progress and timer */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium">
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <div className="flex items-center">
              <div className={`text-sm font-medium ${timeLeft < 5 ? 'text-red-500' : ''}`}>
                <motion.div 
                  animate={{ 
                    scale: timeLeft <= 5 ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
                >
                  {timeLeft}s
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 overflow-hidden">
            <div className="bg-primary h-1.5">
              <motion.div 
                initial={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                animate={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          {/* Question and emoji */}
          <div className="mb-4 text-center">
            <div className="text-4xl mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                {questions[currentQuestion].image}
              </motion.div>
            </div>
            <div className="text-lg font-semibold">
              <motion.h3 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {questions[currentQuestion].question}
              </motion.h3>
            </div>
          </div>
          
          {/* Answer options */}
          <div className="space-y-2">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedAnswer === null
                    ? "border-gray-300 hover:border-primary hover:bg-primary/5"
                    : selectedAnswer === index
                      ? index === questions[currentQuestion].correctAnswer
                        ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                        : "border-red-500 bg-red-50 dark:bg-red-900/30"
                      : index === questions[currentQuestion].correctAnswer && selectedAnswer !== null
                        ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                        : "border-gray-300 opacity-70"
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  whileHover={selectedAnswer === null ? { scale: 1.01, backgroundColor: "rgba(46, 125, 50, 0.1)" } : {}}
                  whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                      selectedAnswer === null
                        ? "bg-primary/10 text-primary"
                        : selectedAnswer === index
                          ? index === questions[currentQuestion].correctAnswer
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : index === questions[currentQuestion].correctAnswer && selectedAnswer !== null
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1">{option}</span>
                    {selectedAnswer !== null && index === questions[currentQuestion].correctAnswer && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        <BadgeCheck className="h-5 w-5 text-green-500 ml-2" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </button>
            ))}
          </div>
          
          {/* Feedback message */}
          <AnimatePresence>
            {showFeedback && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg text-sm">
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: 10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {feedbackMessage}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          
          {/* Timer indicator */}
          <div className="w-full bg-gray-100 h-1 mt-4 rounded-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className={`h-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-primary'}`}> 
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>
          
          {/* Streak indicator */}
          {streak > 0 && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Trophy className="h-3 w-3 mr-1" /> {streak} streak!
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const HeroSection: React.FC = () => {
  const isMobile = useIsMobile();
  const { isSignedIn, user } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [showRoleButtons, setShowRoleButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);

  // Handle Get Started click
  const handleGetStarted = () => {
    setShowRoleButtons(true);
  };

  // Handle role selection
  const handleRoleSelect = (role: 'patient' | 'doctor') => {
    setSelectedRole(role);
    setIsLoading(true);
    
    // Simulate loading for 2 seconds
    setTimeout(() => {
      if (role === 'patient') {
        window.location.href = '/sign-up?role=patient';
      } else {
        window.location.href = '/sign-up?role=doctor';
      }
    }, 2000);
  };

  // Handle dashboard navigation for signed-in users
  const handleDashboard = () => {
    const role = (user?.publicMetadata?.role && typeof user.publicMetadata.role === "string")
      ? user.publicMetadata.role.toLowerCase()
      : "patient";
    window.location.href = `/${role}`;
  };

  useEffect(() => {
    // Add animation class when component is mounted
    const animatedElements = document.querySelectorAll('.reveal');
    animatedElements.forEach(el => {
      el.classList.add('active');
    });
    
    // Setup the canvas for the animated background
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Set canvas dimensions
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Create the animated particles
        const particles: Particle[] = [];
        const particleCount = 30;
        
        class Particle {
          x: number;
          y: number;
          radius: number;
          color: string;
          speedX: number;
          speedY: number;
          opacity: number;
          
          constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 5 + 1;
            this.color = `hsl(142, ${Math.random() * 50 + 50}%, ${Math.random() * 40 + 40}%)`;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
          }
          
          update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Bounce off walls
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
              this.speedX = -this.speedX;
            }
            
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
              this.speedY = -this.speedY;
            }
          }
          
          draw() {
            if (!ctx) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `, ${this.opacity})`);
            ctx.fill();
            
            // Add glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
          }
        }
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle());
        }
        
        // Connect particles with lines if they are close enough
        function connectParticles() {
          if (!ctx) return;
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(46, 125, 50, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }
        
        // Animation loop
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw and update particles
          particles.forEach(particle => {
            particle.update();
            particle.draw();
          });
          
          connectParticles();
          
          animationRef.current = requestAnimationFrame(animate);
        };
        
        animate();
        
        // Cleanup
        return () => {
          window.removeEventListener('resize', resizeCanvas);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }
    }
  }, []);
  
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0" 
        style={{ background: 'linear-gradient(to bottom, rgba(46, 125, 50, 0.1), rgba(0, 0, 0, 0))' }}
      />

      {/* Moving Bar - Moved below navbar */}
      <div className="absolute top-0 left-0 right-0 z-10 mt-28">
        <MovingBar />
      </div>

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="mb-6"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
                  />
                </div>
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
              >
                Setting up your {selectedRole} account...
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 dark:text-gray-400"
              >
                Please wait while we prepare your registration form
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero content */}
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center relative z-10 mt-20">
        <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 reveal scroll-animation-1 relative inline-block">
            <span className="absolute -left-8 -top-6 text-primary/30 dark:text-primary/20 animate-pulse-soft">
              <Sparkles className="h-6 w-6" />
            </span>
            Your Health. <span className="gradient-text relative">
              Our Priority.
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 3C50 0.5 150 0.5 200 3" stroke="url(#paint0_linear)" strokeWidth="5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="0" y1="3" x2="200" y2="3" gradientUnits="userSpaceOnUse">
                    <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
                    <stop offset="0.5" stopColor="hsl(var(--primary))" />
                    <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="absolute -right-8 -bottom-4 text-accent/30 dark:text-accent/20 animate-bounce-gentle">
              <Sparkles className="h-6 w-6" />
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 reveal scroll-animation-2 relative">
            Connect with top doctors, book appointments, and get the care you deserve — all in one secure platform.
            <span className="absolute -right-4 bottom-0 animate-pulse-soft text-primary/30 dark:text-primary/20" style={{ animationDelay: '1.5s' }}>
              <Sparkles className="h-5 w-5" />
            </span>
          </p>
          <div className="flex justify-center lg:justify-start gap-3 reveal scroll-animation-3">
            <AnimatePresence mode="wait">
              {isSignedIn ? (
                <>
                  <MotionButton
                    size="lg"
                    className="gradient-bg group button-3d"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDashboard}
                    key="dashboard"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="flex items-center">
                      Welcome
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </MotionButton>
                </>
              ) : showRoleButtons ? (
                <>
                  <MotionButton 
                    size="lg" 
                    className="gradient-bg group button-3d"
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRoleSelect('patient')}
                    key="patient"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="flex items-center">
                      Patient
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </MotionButton>
                  <MotionButton
                    size="lg"
                    className="gradient-bg group button-3d"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRoleSelect('doctor')}
                    key="doctor"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="flex items-center">
                      Doctor
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </MotionButton>
                </>
              ) : (
                <>
                  <MotionButton 
                    size="lg" 
                    className="gradient-bg group button-3d" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGetStarted}
                    key="get-started"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="flex items-center">
                      Get Started
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </MotionButton>
                  <MotionButton 
                    asChild 
                    size="lg" 
                    variant="outline" 
                    className="group" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    key="learn-more"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                  </MotionButton>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4 reveal scroll-animation-3" style={{ transitionDelay: '0.7s' }}>
            <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Top Rated Doctors</span>
            </div>
            <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <AnimatePresence mode="wait">
            {/* 3D Pin Demo Component */}
            <AnimatedPinDemo />
          </AnimatePresence>
        </div>
      </div>
      
      {/* Floating medical symbols with enhanced animations */}
      <div className="absolute bottom-10 left-10 w-32 h-32 opacity-20 animate-spin-slow rounded-full border border-primary dark:border-primary/40 z-10"></div>
      <div className="absolute top-20 right-20 w-24 h-24 opacity-10 animate-spin-slow rounded-full border-2 border-accent dark:border-accent/40 z-10" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
    </section>
  );
};

export default HeroSection;

export { HealthGame };
