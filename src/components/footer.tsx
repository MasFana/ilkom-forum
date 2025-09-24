export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer role="contentinfo" className="mt-8 border-t border-black/10 dark:border-white/10 py-6 text-center text-sm opacity-80">
            Made with <span aria-hidden>❤️</span> Masfana © {year}
        </footer>
    );
}
