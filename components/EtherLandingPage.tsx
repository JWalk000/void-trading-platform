"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Brain, TrendingUp, Zap, Shield, Cpu } from "lucide-react"
import AuthModal from "@/components/AuthModal"

export default function EtherLandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VOID</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-orange-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-orange-400 transition-colors">
                How It Works
              </a>
              <a href="#performance" className="text-slate-300 hover:text-orange-400 transition-colors">
                Performance
              </a>
              <a href="/dashboard" className="text-slate-300 hover:text-orange-400 transition-colors">
                Dashboard
              </a>
              <AuthModal />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge className="mb-6 bg-orange-400/10 text-orange-400 border-orange-400/20 hover:bg-orange-400/20">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Trading
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              INTELLIGENT
              <span className="block bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                TRADING
              </span>
              AUTOMATION
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              VOID leverages advanced AI to execute trades based on market parameters and external factors, continuously
              learning from every transaction to optimize your trading strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border-0 px-8 py-3"
              >
                Start Trading
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powered by Advanced AI</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the future of trading with our intelligent automation system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-400/50 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Machine Learning</h3>
                <p className="text-slate-300 leading-relaxed">
                  Continuously learns from market patterns and trading outcomes to improve decision-making accuracy over
                  time.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-400/50 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Smart Parameters</h3>
                <p className="text-slate-300 leading-relaxed">
                  Analyzes multiple market indicators, news sentiment, and external factors to make informed trading
                  decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-400/50 transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Risk Management</h3>
                <p className="text-slate-300 leading-relaxed">
                  Built-in risk controls and position sizing algorithms protect your capital while maximizing
                  opportunities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance Stats */}
      <section id="performance" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                94%
              </div>
              <div className="text-slate-300">Success Rate</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                2.3x
              </div>
              <div className="text-slate-300">Average Return</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                24/7
              </div>
              <div className="text-slate-300">Market Monitoring</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                {"<"}1s
              </div>
              <div className="text-slate-300">Execution Speed</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How VOID Works</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">Simple setup, powerful results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Set Parameters</h3>
              <p className="text-slate-300">
                Define your risk tolerance, trading preferences, and investment goals through our intuitive interface.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Analysis</h3>
              <p className="text-slate-300">
                Our AI continuously monitors markets, analyzes patterns, and identifies optimal trading opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Execute & Learn</h3>
              <p className="text-slate-300">
                Trades are executed automatically while the system learns from outcomes to improve future performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of traders who trust VOID to optimize their investment strategies.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white border-0 px-12 py-4 text-lg"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VOID</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2024 VOID. All rights reserved. | Intelligent Trading Automation
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 