import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <header>
            <nav>
                <Link href='/' className="logo">
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />

                    <p>DevEvent</p>
                </Link>

                <ul>
                    <Link href="/">Home</Link>
                    <Link href="/events/create">Create Event</Link>
                    <Link href="https://github.com/virza805/test-cursor"><img src="https://img.shields.io/badge/-GitHub-black?style=for-the-badge&logo=GitHub&logoColor=white" /></Link>
                </ul>
            </nav>
        </header>
    )
}

export default Navbar
