'use client';

import styled from 'styled-components';

const SidebarWrapper = styled.div`
  background-color: var(--background);
  transition: transform 0.2s ease;
  height: 100%;
  position: fixed;
  width: 16rem;
  flex-shrink: 0;
  z-index: 202;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  flex-direction: column;
  padding-top: var(--space-10);
  padding-bottom: var(--space-10);
  padding-left: var(--space-6);
`;

const Overlay = styled.div`
  position: fixed;
  background-color: rgba(15, 23, 42, 0.3);
  inset: 0;
  z-index: 201;
  transition: opacity 0.2s ease;
  opacity: 0.8;
  pointer-events: none;
  visibility: hidden;

  @media (min-width: 768px) {
    display: none;
    z-index: auto;
    opacity: 1;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: var(--space-8);
  justify-content: space-between;
  padding-left: var(--space-10);
  padding-right: var(--space-10);
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  margin-top: var(--space-13);
  padding-left: var(--space-4);
  padding-right: var(--space-4);
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  gap: var(--space-12);
  justify-content: center;
  padding-left: var(--space-8);
  padding-right: var(--space-8);
  padding-bottom: var(--space-8);
  padding-top: var(--space-18);

  @media (min-width: 768px) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

export const Sidebar = {
  Wrapper: SidebarWrapper,
  Header,
  Body,
  Footer,
  Overlay,
};
