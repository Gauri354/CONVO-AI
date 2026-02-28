import Image from "next/image";
import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="flex flex-col gap-8 w-full mt-20 border-t border-dark-300 pt-10 pb-10">
            <div className="flex flex-col md:flex-row justify-between gap-10">
                <div className="flex flex-col gap-4 max-w-xs">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="SmartInterview Logo"
                            width={32}
                            height={32}
                        />
                        <h3 className="text-lg font-bold text-primary-100">SmartInterview</h3>
                    </Link>
                    <p className="text-sm text-light-400">
                        Empowering your career journey with AI-driven interview practice and real-time feedback.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-10 sm:gap-20">
                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-primary-100">Product</h4>
                        <ul className="flex flex-col gap-2 text-sm text-light-400">
                            <li><Link href="/interview" className="hover:text-primary-200 transition-colors">Practice</Link></li>
                            <li><Link href="/reports" className="hover:text-primary-200 transition-colors">Reports</Link></li>
                            <li><Link href="#" className="hover:text-primary-200 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-primary-100">Resources</h4>
                        <ul className="flex flex-col gap-2 text-sm text-light-400">
                            <li><Link href="#" className="hover:text-primary-200 transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-primary-200 transition-colors">FAQ</Link></li>
                            <li><Link href="#" className="hover:text-primary-200 transition-colors">Support</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="font-semibold text-primary-100">Company</h4>
                        <ul className="flex flex-col gap-2 text-sm text-light-400">
                            <li><Link href="#" className="hover:text-primary-200 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-primary-200 transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-primary-200 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-dark-300">
                <p className="text-sm text-light-600">
                    &copy; {currentYear} SmartInterview. All rights reserved.
                </p>

                <div className="flex items-center gap-4">
                    <Link href="#" className="text-light-400 hover:text-primary-200 transition-colors">
                        <Github size={20} />
                    </Link>
                    <Link href="#" className="text-light-400 hover:text-primary-200 transition-colors">
                        <Twitter size={20} />
                    </Link>
                    <Link href="#" className="text-light-400 hover:text-primary-200 transition-colors">
                        <Linkedin size={20} />
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
