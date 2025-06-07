"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  Music,
  Cake,
  Star,
  ArrowRight,
  Check,
  X,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Play,
  Pause,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Confetti from "react-confetti"
import { Slider } from "@/components/ui/slider"

// Hook personalizado para el tamaño de ventana
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowSize
}

const AudioPlayer = ({
  audioRef,
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  currentSong,
  setCurrentSong,
  hasError,
  setHasError,
  songs,
  onPlayStateChange,
  resetTimeout,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  volume: number[]
  setVolume: (volume: number[]) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  currentSong: number
  setCurrentSong: (song: number) => void
  hasError: boolean
  setHasError: (error: boolean) => void
  songs: Array<{ title: string; src: string }>
  onPlayStateChange?: (isPlaying: boolean) => void
  resetTimeout?: () => void
}) => {
  const togglePlay = () => {
    if (audioRef.current && !hasError) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {
          setHasError(true)
        })
      }
      const newState = !isPlaying
      setIsPlaying(newState)

      if (onPlayStateChange) {
        onPlayStateChange(newState)
      }
    }
    resetTimeout?.()
  }

  const toggleMute = () => {
    if (audioRef.current && !hasError) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
    resetTimeout?.()
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (audioRef.current && !hasError) {
      audioRef.current.volume = value[0] / 100
    }
    resetTimeout?.()
  }

  const nextSong = () => {
    setCurrentSong((currentSong + 1) % songs.length)
    setHasError(false)
    setIsPlaying(true)
    resetTimeout?.()
  }

  const prevSong = () => {
    setCurrentSong((currentSong - 1 + songs.length) % songs.length)
    setHasError(false)
    setIsPlaying(true)
    resetTimeout?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-4 right-16 z-50 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-rose-200 p-2 sm:p-3"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,242,242,0.95) 100%)",
        width: "280px",
      }}
    >
      {/* Título de la canción */}
      <div className="text-xs text-gray-600 mb-2 text-center truncate">
        {hasError ? "Audio no disponible" : songs[currentSong].title}
      </div>

      {/* Controles principales */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={prevSong}
          className="h-8 w-8 p-0 hover:bg-rose-100"
          disabled={hasError}
        >
          <SkipBack className="h-4 w-4 text-rose-600" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlay}
          className="h-10 w-10 p-0 hover:bg-rose-100 bg-rose-50"
          disabled={hasError}
        >
          {isPlaying ? <Pause className="h-5 w-5 text-rose-600" /> : <Play className="h-5 w-5 text-rose-600 ml-0.5" />}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={nextSong}
          className="h-8 w-8 p-0 hover:bg-rose-100"
          disabled={hasError}
        >
          <SkipForward className="h-4 w-4 text-rose-600" />
        </Button>
      </div>

      {/* Control de volumen */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleMute}
          className="h-6 w-6 p-0 hover:bg-rose-100 flex-shrink-0"
          disabled={hasError}
        >
          {isMuted || volume[0] === 0 ? (
            <VolumeX className="h-3 w-3 text-rose-600" />
          ) : (
            <Volume2 className="h-3 w-3 text-rose-600" />
          )}
        </Button>

        <div className="flex-1">
          <Slider
            value={isMuted ? [0] : volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            disabled={hasError}
            className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-rose-200 [&_[role=slider]]:bg-rose-500 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-rose-500 [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0"
          />
        </div>

        <span className="text-xs text-gray-500 w-8 text-right">{isMuted ? 0 : volume[0]}</span>
      </div>

      {hasError && <div className="text-xs text-gray-400 text-center mt-1">🎵 Demo mode - Add your music files</div>}
    </motion.div>
  )
}

const ProposalButtons = ({ onYesClick }: { onYesClick: () => void }) => {
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 })
  const [noButtonAttempts, setNoButtonAttempts] = useState(0)
  const [showYesConfirmation, setShowYesConfirmation] = useState(false)
  const [canMoveNoButton, setCanMoveNoButton] = useState(true)
  const [buttonsEnabled, setButtonsEnabled] = useState(false)

  const moveNoButton = () => {
    if (!canMoveNoButton) return

    setCanMoveNoButton(false)
    setTimeout(() => setCanMoveNoButton(true), 1000)

    const newAttempts = noButtonAttempts + 1
    setNoButtonAttempts(newAttempts)

    const maxX = 250
    const maxY = 120
    const minAllowedX = -25

    let newX: number, newY: number

    do {
      const randX = (Math.random() - 0.5) * maxX
      newX = Math.max(randX, minAllowedX)

      newY = (Math.random() - 0.5) * maxY
    } while (Math.abs(newX) < 80 && Math.abs(newY) < 40)

    setNoButtonPosition({ x: newX, y: newY })
  }

  const handleYesClick = () => {
    setShowYesConfirmation(true)
    onYesClick()
  }

  const getNoButtonText = () => {
    if (noButtonAttempts === 0) return "No"
    if (noButtonAttempts === 1) return "¿Segura?"
    if (noButtonAttempts === 2) return "Piénsalo"
    if (noButtonAttempts === 3) return "Imposible"
    return "¡Jamás!"
  }

  const getYesButtonText = () => {
    if (noButtonAttempts === 0) return "Sí, quiero"
    if (noButtonAttempts === 1) return "Por supuesto"
    if (noButtonAttempts === 2) return "Obviamente sí"
    if (noButtonAttempts === 3) return "SÍ SÍ SÍ"
    if (noButtonAttempts >= 4) return "LA ÚNICA OPCIÓN"
    return "¡Sí, quiero!"
  }

  if (showYesConfirmation) {
    return (
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center"
      >
        {/* Estrella giratoria y pulsante */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [0, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            delay: 0.3,
            duration: 1.2,
            ease: "easeInOut",
          }}
          className="mb-4"
        >
          <Star className="h-20 w-20 text-yellow-400" />
        </motion.div>

        {/* Título principal */}
        <motion.h3
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          className="text-4xl font-bold text-rose-600 mb-2"
        >
          ¡Sabía que dirías que sí!
        </motion.h3>

        {/* Mensaje secundario */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
          className="text-xl text-gray-700"
        >
          Nadie fue obligado a decir que si.
        </motion.p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6 }}
      className={`flex flex-col items-center justify-center relative ${buttonsEnabled ? "" : "pointer-events-none"}`}
      onAnimationComplete={() => {
        setButtonsEnabled(true)
      }}
    >
      {/* Contenedor de botones - Layout diferente para móvil */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 relative min-h-[120px] sm:min-h-[180px] w-full">
        {/* Botón Sí - A la izquierda en móvil, centrado en desktop */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={
            noButtonAttempts > 0
              ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 4px 20px rgba(244, 63, 94, 0.3)",
                    "0 8px 30px rgba(244, 63, 94, 0.5)",
                    "0 4px 20px rgba(244, 63, 94, 0.3)",
                  ],
                }
              : {}
          }
          transition={{
            duration: 0.8,
            repeat: noButtonAttempts > 0 ? Number.POSITIVE_INFINITY : 0,
            repeatType: "reverse",
          }}
          onClick={handleYesClick}
          className="bg-rose-500 hover:bg-rose-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold shadow-lg transition-all duration-300 z-10 order-1 sm:order-none"
          style={{
            minWidth: noButtonAttempts > 2 ? "180px" : "140px",
            fontSize: noButtonAttempts > 2 ? "1.3rem" : "1.1rem",
          }}
        >
          {getYesButtonText()}
        </motion.button>

        {/* Botón No - A la derecha en móvil, centrado en desktop */}
        <motion.button
          animate={{
            x: noButtonPosition.x,
            y: noButtonPosition.y,
            scale: Math.max(0.6, 1 - noButtonAttempts * 0.08),
            rotate: noButtonPosition.x * 0.3,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
          }}
          onMouseEnter={moveNoButton}
          onMouseDown={moveNoButton}
          onTouchStart={moveNoButton}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-base sm:text-lg text-gray-600 border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200 cursor-pointer select-none z-10 order-2 sm:order-none"
          style={{
            fontSize: Math.max(0.7, 1 - noButtonAttempts * 0.05) + "rem",
            opacity: Math.max(0.4, 1 - noButtonAttempts * 0.08),
          }}
        >
          {getNoButtonText()}
        </motion.button>
      </div>

      {/* Mensajes de ánimo - Siempre en la parte inferior */}
      {noButtonAttempts > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs flex justify-end px-4 mt-6 sm:mt-4"
        >
          <p className="text-sm text-rose-600 font-medium px-2">
            {noButtonAttempts === 1 && "Bro? Respeta"}
            {noButtonAttempts === 2 && "No, no, eso pa qué, mejor ponte a aprender inglés"}
            {noButtonAttempts === 3 && "Hasta el botón sabe cuál es la respuesta correcta 💕"}
            {noButtonAttempts >= 4 && "Pq? :("}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// Componente de corazones flotantes
const FloatingHearts = () => {
  const { width, height } = useWindowSize()
  const [hearts, setHearts] = useState<Array<{
    x: number
    y: number
    scale: number
    fontSize: number
    delay: number
    duration: number
  }> | null>(null)

  useEffect(() => {
    if (width && height) {
      const newHearts = Array.from({ length: 15 }, () => ({
        x: Math.random() * width,
        y: height + 50,
        scale: Math.random() * 0.5 + 0.5,
        fontSize: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 15,
      }))
      setHearts(newHearts)
    }
  }, [width, height])

  if (!width || !height || !hearts) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((heart, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-300 opacity-20"
          initial={{
            x: heart.x,
            y: heart.y,
            scale: heart.scale,
          }}
          animate={{
            y: -50,
            x: Math.random() * width,
            rotate: 360,
          }}
          transition={{
            duration: heart.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: heart.delay,
            ease: "linear",
          }}
          style={{ fontSize: `${heart.fontSize}px` }}
        >
          💕
        </motion.div>
      ))}
    </div>
  )
}

// Componente de partículas de fondo
const BackgroundParticles = () => {
  const { width, height } = useWindowSize()
  const [particles, setParticles] = useState<Array<{
    x: number
    y: number
    duration: number
  }> | null>(null)

  useEffect(() => {
    if (width && height) {
      const newParticles = Array.from({ length: 20 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        duration: Math.random() * 20 + 10,
      }))
      setParticles(newParticles)
    }
  }, [width, height])

  if (!width || !height || !particles) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-rose-200 rounded-full opacity-30"
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            x: Math.random() * width,
            y: Math.random() * height,
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [currentSection, setCurrentSection] = useState("landing")
  const [showConfetti, setShowConfetti] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [showAnswer, setShowAnswer] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const { width, height } = useWindowSize()
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [currentIncorrectMessage, setCurrentIncorrectMessage] = useState("")
  const [showPlayer, setShowPlayer] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const playerTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Estados del reproductor de audio movidos al componente principal
  const [volume, setVolume] = useState([50])
  const [isMuted, setIsMuted] = useState(false)
  const [currentSong, setCurrentSong] = useState(0)
  const [hasError, setHasError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const songs = [
    {
      title: "ONLY",
      src: "/ONLY.mp3",
    },
    {
      title: "Enamorado tuyo",
      src: "/Enamorado_tuyo.mp3",
    },
    {
      title: "Mayor que yo 3",
      src: "/Mayor_Que_Yo_3.mp3",
    },
  ]

  const resetPlayerTimeout = useCallback(() => {
    if (playerTimeoutRef.current) {
      clearTimeout(playerTimeoutRef.current)
    }
    playerTimeoutRef.current = setTimeout(() => {
      setShowPlayer(false)
    }, 3000)
  }, [])

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (playerTimeoutRef.current) {
        clearTimeout(playerTimeoutRef.current)
      }
    }
  }, [])

  // Efecto para manejar la reproducción de audio
  useEffect(() => {
    if (!audioRef.current) return

    const playAudio = async () => {
      try {
        await audioRef.current?.play()
        setIsPlaying(true)
      } catch (error) {
        console.error("Error al reproducir:", error)
        setHasError(true)
        setIsPlaying(false)
      }
    }

    // Solo reproducir si no hay error y está en estado de reproducción
    if (!hasError && isPlaying) {
      playAudio()
    }
  }, [currentSong, hasError, isPlaying])

  // Manejar eventos del audio
  const handleAudioError = () => {
    setHasError(true)
    setIsPlaying(false)
  }

  const handleAudioLoad = () => {
    setHasError(false)
  }

  const handleAudioPlay = () => {
    setIsPlaying(true)
  }

  const handleAudioPause = () => {
    setIsPlaying(false)
  }

  const handleAudioEnded = () => {
    setCurrentSong((prev) => (prev + 1) % songs.length)
    setHasError(false)
    setIsPlaying(true)
  }

  // Manejar la visibilidad del reproductor
  const handlePlayerVisibility = () => {
    if (playerTimeoutRef.current) {
      clearTimeout(playerTimeoutRef.current)
    }

    if (!showPlayer) {
      setShowPlayer(true)
      if (!isPlaying && audioRef.current && !hasError) {
        audioRef.current.play().catch(() => {
          setHasError(true)
        })
      }
      resetPlayerTimeout()
    } else {
      setShowPlayer(false)
    }
  }

  const questions = [
    {
      question: "¿Qué me preparaste la primera vez que nos vimos?",
      options: [
        { text: "Empanadas", message: "¿Empanadas? Eso nunca pasó." },
        { text: "Chocotorta", message: "Era chocotorta, sí... pero te faltó algo importante." },
        { text: "Chocotorta envenenada", message: "" }, // Respuesta correcta
        { text: "Alfajores", message: "No fueron alfajores, sabés lo que hiciste." },
      ],
      correctAnswer: "Chocotorta envenenada",
      explanation: "Bien, era una chocotorta envenenada, pero me la comí igual.",
    },
    {
      question: "¿Qué diferencia de edad hay entre nosotros?",
      options: [
        { text: "¡10 años!", message: "¿10 años? Exageraste un poco." },
        { text: "Yo soy mayor, por 10 meses", message: "No, tú eres la mayor." },
        { text: "Tú eres mayor, por 10 meses", message: "Bro? Respeta" },
        { text: "40 y 20 🗣️🗣️", message: "" }, // Respuesta correcta
      ],
      correctAnswer: "40 y 20 🗣️🗣️",
      explanation: "Correcto, 40 y 20",
    },
    {
      question: "¿Qué es lo que más te molesto seguido?",
      options: [
        { text: "Que no me gusta el mate", message: "Sí, pero no es lo único." },
        { text: "Que soy más joven", message: "Eso también, pero hay más." },
        { text: "Que te gano en todo", message: "Te falta completar la lista." },
        { text: "Todas las anteriores", message: "" }, // Respuesta correcta
      ],
      correctAnswer: "Todas las anteriores",
      explanation: "Obvio que todas. Si no te molesto un día, no soy yo.",
    },
    {
      question: "¿Qué me enamoró de tus ojos?",
      options: [
        { text: "El color", message: "No es eso. Fue algo más específico." },
        { text: "La forma en que me miras", message: "Casi, pero no es lo que dije." },
        { text: "Que los cierras cada vez que sonríes", message: "No, eso no fue lo que me hizo quedarme mirándote." },
        { text: "Que son color miel y dulces como tú", message: "" }, // Respuesta correcta
      ],
      correctAnswer: "Que son color miel y dulces como tú",
      explanation: "Correcto. Son color miel. Y dulces. Como tú.",
    },
    {
      question: "¿Qué momento juntos ha sido tu favorito?",
      options: [
        { text: "Todos han sido especiales", message: "" }, // Respuesta correcta
      ],
      correctAnswer: "Todos han sido especiales",
      explanation: "¡Perfecto! Cada momento contigo es único y especial para mí.",
    },
  ]

  const handleAnswer = (answer: string) => {
    const currentQ = questions[currentQuestion]
    const selectedOption = currentQ.options.find((opt) => opt.text === answer)
    const correct = answer === currentQ.correctAnswer

    setIsCorrect(correct)
    setShowAnswer(true)
    setAnswers([...answers, answer])

    // Guardar mensaje específico para esta respuesta
    if (!correct && selectedOption) {
      setCurrentIncorrectMessage(selectedOption.message)
    }

    if (correct) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    setShowAnswer(false)
    setCurrentIncorrectMessage("") // Limpiar mensaje para siguiente pregunta
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setQuizCompleted(true)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0) // Reiniciar preguntas
    setScore(0) // Reiniciar puntuación
    setAnswers([]) // Limpiar respuestas
  }

  const handleShowProposal = () => {
    setCurrentSection("proposal")
  }

  // Manejar gesto de deslizar
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100 && currentSection === "landing") {
      setCurrentSection("memories")
    }
  }

  // Manejar scroll con rueda de ratón
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 50 && currentSection === "landing") {
      setCurrentSection("memories")
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden"
      onWheel={handleWheel}
    >
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

      {/* Elemento de audio persistente - siempre montado */}
      <audio
        key={currentSong}
        ref={audioRef}
        src={songs[currentSong].src}
        onEnded={handleAudioEnded}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onError={handleAudioError}
        onLoadedData={handleAudioLoad}
        preload="none"
        style={{ display: "none" }} // Oculto pero siempre presente
      />

      {/* Botón para mostrar/ocultar reproductor */}
      <button
        onClick={handlePlayerVisibility}
        className="fixed top-4 right-4 z-50 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-rose-50 transition-colors"
        title={showPlayer ? "Ocultar música" : "Mostrar música"}
      >
        {isPlaying ? <Pause className="h-6 w-6 text-rose-600" /> : <Play className="h-6 w-6 text-rose-600" />}
      </button>

      {/* Fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-100 to-rose-200 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-rose-100 to-transparent"
          animate={{
            background: [
              "linear-gradient(45deg, transparent 0%, rgba(251, 113, 133, 0.1) 50%, transparent 100%)",
              "linear-gradient(225deg, transparent 0%, rgba(244, 63, 94, 0.1) 50%, transparent 100%)",
              "linear-gradient(45deg, transparent 0%, rgba(251, 113, 133, 0.1) 50%, transparent 100%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <FloatingHearts />
      <BackgroundParticles />

      <AnimatePresence mode="wait">
        {currentSection === "landing" && (
          <motion.section
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12 text-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Heart className="h-16 w-16 text-rose-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 relative">
                <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent pb-[0.15em]">
                  Para mi mujer
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
                He creado este sitio para expresar lo que siento por ti y hacerte una pregunta muy importante...
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <Button
                onClick={() => setCurrentSection("memories")}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Comenzar nuestro viaje
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", duration: 1.5 }}
              className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-8"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  className="mb-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-rose-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.div>
                <div className="flex space-x-2 items-center">
                  <Heart className="h-5 w-5 text-rose-400" />
                  <p className="text-sm text-gray-600">Desliza para continuar</p>
                  <Heart className="h-5 w-5 text-rose-400" />
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}

        {currentSection === "memories" && (
          <motion.section
            key="memories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12"
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-bold text-rose-600 mb-8 text-center bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
            >
              Cosas que amo de ti
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-rose-100 flex items-start space-x-4 hover:shadow-2xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,242,242,0.9) 100%)",
                }}
              >
                <motion.div
                  className="bg-gradient-to-br from-rose-100 to-pink-100 p-3 rounded-full shadow-md"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Music className="h-6 w-6 text-rose-500" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Tu amor por BTS</h3>
                  <p className="text-gray-600">Me encanta tu amor por BTS y RM; El como me hablas de ellos.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-rose-100 flex items-start space-x-4 hover:shadow-2xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,242,242,0.9) 100%)",
                }}
              >
                <motion.div
                  className="bg-gradient-to-br from-rose-100 to-pink-100 p-3 rounded-full shadow-md"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Star className="h-6 w-6 text-rose-500" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Tus hermosos ojos color miel</h3>
                  <p className="text-gray-600">
                    Tus ojos color miel siempre llaman mi atención. Tienen algo que me resulta muy especial.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-rose-100 flex items-start space-x-4 hover:shadow-2xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,242,242,0.9) 100%)",
                }}
              >
                <motion.div
                  className="bg-gradient-to-br from-rose-100 to-pink-100 p-3 rounded-full shadow-md"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Cake className="h-6 w-6 text-rose-500" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Tu deliciosa chocotorta</h3>
                  <p className="text-gray-600">Estaba sabrosa, pero sigo manteniendo que estaba envenenada.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-rose-100 flex items-start space-x-4 hover:shadow-2xl transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,242,242,0.9) 100%)",
                }}
              >
                <motion.div
                  className="bg-gradient-to-br from-rose-100 to-pink-100 p-3 rounded-full shadow-md"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <Heart className="h-6 w-6 text-rose-500" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">Tu acento argentino</h3>
                  <p className="text-gray-600">
                    Ese acento argentino que se te escapa a veces, tu manera de hablar y tu energía tienen algo que me
                    gusta mucho.
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12"
            >
              <Button
                onClick={() => setCurrentSection("quiz")}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-6 rounded-full text-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continuar a los juegos <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.section>
        )}

        {currentSection === "quiz" && (
          <motion.section
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-rose-100"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,242,242,0.95) 100%)",
              }}
            >
              {!quizStarted ? (
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-rose-600 mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    ¡Juguemos un poco!
                  </h2>
                  <p className="text-gray-700 mb-8">
                    Antes de llegar a la parte más importante, veamos cuánto nos conoces...
                  </p>
                  <Button
                    onClick={handleStartQuiz}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg"
                  >
                    Comenzar el juego
                  </Button>
                </div>
              ) : !quizCompleted ? (
                <div>
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Pregunta {currentQuestion + 1} de {questions.length}
                    </span>
                    <span className="text-sm font-medium text-rose-500">
                      Puntuación: {score}/{questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentQuestion / questions.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-6">{questions[currentQuestion].question}</h3>

                  {!showAnswer ? (
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(option.text)}
                          className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {option.text}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 rounded-xl border-2 shadow-lg ${
                        isCorrect
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                          : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300"
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {isCorrect ? (
                            <Check className="h-8 w-8 text-green-600 mr-3" />
                          ) : (
                            <X className="h-8 w-8 text-red-600 mr-3" />
                          )}
                        </motion.div>
                        <h4 className={`text-xl font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                          {isCorrect ? "¡Correcto!" : "¡Oops!"}
                        </h4>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {isCorrect ? questions[currentQuestion].explanation : currentIncorrectMessage}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-gray-600">
                          La respuesta correcta era: <strong>{questions[currentQuestion].correctAnswer}</strong>
                        </p>
                      )}

                      <div className="mt-4 flex justify-end">
                        <Button
                          onClick={handleNextQuestion}
                          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                        >
                          Continuar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Heart className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-rose-600 mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    ¡Puntuación final: {score}/{questions.length}!
                  </h2>
                  <p className="text-gray-700 mb-8">
                    {score === questions.length
                      ? "Increíble, que buena memoria ❤️"
                      : score >= questions.length / 2
                        ? "Bro, respeta"
                        : "Yo voy en la taza..."}
                  </p>
                  <p className="text-gray-600 mb-8">Ahora llegó el momento más importante... ¿Estás lista?</p>
                  <Button
                    onClick={handleShowProposal}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg"
                  >
                    Continuar
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.section>
        )}

        {currentSection === "proposal" && (
          <motion.section
            key="proposal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12 text-center relative"
          >
            {/* Contenido principal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                delay: 1,
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full mb-8 relative z-5 border border-rose-200"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254,242,242,0.95) 100%)",
              }}
            >
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: [0, 360, 0] }}
                transition={{
                  delay: 1.2,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="mb-8"
              >
                <Heart className="h-20 w-20 text-rose-500 mx-auto mb-6" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="text-4xl md:text-5xl font-bold text-rose-600 mb-6 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
              >
                ¿Quieres ser mi novia?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="text-xl text-gray-700 mb-8"
              >
                Me gustas mucho, ivi, quiero seguir creando recuerdos juntos, probar más de tus recetas y perderme en
                esos ojos lindos.
              </motion.p>

              <ProposalButtons onYesClick={() => setShowConfetti(true)} />
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-gray-600 relative z-5"
            >
              <p>Con todo mi amor ❤️</p>
            </motion.div>

            {/* Efecto de foco */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ delay: 3, duration: 2 }}
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)",
              }}
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Reproductor de audio - solo se muestra cuando showPlayer es true */}
      <AnimatePresence>
        {showPlayer && (
          <AudioPlayer
            key="audio-player"
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            currentSong={currentSong}
            setCurrentSong={setCurrentSong}
            hasError={hasError}
            setHasError={setHasError}
            songs={songs}
            onPlayStateChange={setIsPlaying}
            resetTimeout={resetPlayerTimeout}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
