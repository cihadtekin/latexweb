<?php
$source = '\documentclass[12pt]{article}

\usepackage{amsmath}    % need for subequations
\usepackage{graphicx}   % need for figures
\usepackage{verbatim}   % useful for program listings
\usepackage{color}      % use if color is used in text
\usepackage{subfigure}  % use for side-by-side figures
\usepackage{hyperref}   % use for hypertext links, including those to external documents and URLs

\setlength{\parskip}{3pt plus 2pt}
\setlength{\parindent}{20pt}
\setlength{\oddsidemargin}{0.5cm}
\setlength{\evensidemargin}{0.5cm}
\setlength{\marginparsep}{0.75cm}
\setlength{\marginparwidth}{2.5cm}
\setlength{\marginparpush}{1.0cm}
\setlength{\textwidth}{150mm}
\begin{document}

\begin{center}
{\large Introduction to \LaTeX} \\ % \\ = new line
\copyright 2006 by Harvey Gould \\
December 5, 2006
\end{center}

\section{Introduction}
\TeX\ looks more difficult than it is. It is
almost as easy as $\pi$. See how easy it is to make special
symbols such as $\alpha$,
$\beta$, $\gamma$,
$\delta$, $\sin x$, $\hbar$, $\lambda$, $\ldots$ We also can make
subscripts
$A_{x}$, $A_{xy}$ and superscripts, $e^x$, $e^{x^2}$, and
$e^{a^b}$. We will use \LaTeX, which is based on \TeX\ and has
many higher-level commands (macros) for formatting, making
tables, etc. More information can be found in Ref.~\cite{latex}.

\end{document}';



// Config
$tmpDir = '/latexfiles/';

// Create file
$name = microtime(TRUE) . '.tex';
$file = $tmpDir . $name;
file_put_contents($file, $source);

// Run program
$programOutput = system('latex '. $file .' -output-directory ' . $tmpDir);

// Remove temporary files
rmdir($file);
