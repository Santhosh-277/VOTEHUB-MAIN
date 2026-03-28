import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Vote, Shield, Users, BarChart3, Lock, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">VoteHub</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Features</a>
              <a href="#security" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">Security</a>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-300 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-40 right-10 w-72 h-72 bg-purple-300 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="space-y-4" variants={itemVariants}>
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Next-Gen Voting Platform</span>
                </motion.div>
                <motion.h1
                  className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
                  variants={itemVariants}
                >
                  Democratic Elections Made Simple
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
                  variants={itemVariants}
                >
                  A secure, transparent, and user-friendly voting platform designed for modern colleges. Cast your vote with confidence.
                </motion.p>
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg w-full"
                  >
                    <Users className="w-5 h-5" />
                    Student Portal
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate('/admin/auth')}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white px-8 py-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg w-full"
                  >
                    <Shield className="w-5 h-5" />
                    Admin Portal
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div className="flex items-center gap-6 pt-4" variants={itemVariants}>
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Secure & Encrypted</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Real-time Results</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Visual - 3D Card */}
            <motion.div
              className="relative hidden md:block"
              variants={itemVariants}
              style={{
                perspective: '1000px',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-100 dark:from-blue-900/30 to-indigo-100 dark:to-indigo-900/30 rounded-3xl blur-3xl opacity-60"
                animate={floatingVariants.animate}
              />
              <motion.div
                className="relative bg-gradient-to-br from-blue-50 dark:from-gray-800 to-indigo-50 dark:to-gray-800 rounded-3xl p-8 border border-blue-200 dark:border-gray-700"
                animate={floatingVariants.animate}
                style={{
                  rotateX: mousePosition.y > window.innerHeight / 2 ? 5 : -5,
                  rotateY: mousePosition.x > window.innerWidth / 2 ? -5 : 5,
                }}
                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Vote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Cast Your Vote</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Secure & Anonymous</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Instant Confirmation</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your vote is recorded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Live Results</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Transparent & Real-time</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Everything you need for secure and transparent elections</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Military-Grade Security',
                description: 'End-to-end encryption with blockchain verification ensures your vote is secure and tamper-proof.',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Live voting statistics and detailed analytics dashboards for administrators and observers.',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Users,
                title: 'User Management',
                description: 'Comprehensive voter registration and role-based access control for seamless administration.',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: Vote,
                title: 'Multi-Election Support',
                description: 'Create and manage multiple concurrent elections with customizable voting options.',
                color: 'bg-orange-100 text-orange-600',
              },
              {
                icon: Shield,
                title: 'Audit Trail',
                description: 'Complete logging and audit trails for compliance and transparency requirements.',
                color: 'bg-red-100 text-red-600',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                description: 'Automatic result calculation and instant publication with detailed breakdowns.',
                color: 'bg-yellow-100 text-yellow-600',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 ${feature.color} dark:bg-opacity-20 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portal Comparison */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Portal</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Select the right access level for your role</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Portal */}
            <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-900/10 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Portal</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">Access voting opportunities and participate in college elections securely.</p>
              <ul className="space-y-3 mb-8">
                {['Browse active elections', 'Cast secure votes', 'View results', 'Track voting history'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-semibold transition-all"
              >
                Enter Student Portal
              </Button>
            </div>

            {/* Admin Portal */}
            <div className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-purple-100 dark:to-purple-900/10 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Administrator Portal</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">Manage elections, monitor voting, and access comprehensive analytics.</p>
              <ul className="space-y-3 mb-8">
                {['Create elections', 'Manage voters', 'View analytics', 'Post results'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/admin/auth')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-lg font-semibold transition-all"
              >
                Enter Admin Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Vote?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of students participating in secure, transparent elections.</p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-6 rounded-lg font-semibold flex items-center justify-center gap-2 mx-auto transition-all"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Vote className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-white">VoteHub</span>
              </div>
              <p className="text-sm">Secure voting for modern colleges.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Vote. All rights reserved. SANJAY R SANTHOSH C reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
