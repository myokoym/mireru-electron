# Makefile for Mireru Demo

CC = gcc
CFLAGS = -Wall -Wextra -std=c99
TARGET = demo
SOURCES = main.c utils.c

# Default target
all: $(TARGET)

# Build target
$(TARGET): $(SOURCES)
	$(CC) $(CFLAGS) -o $@ $^

# Clean build artifacts
clean:
	rm -f $(TARGET) *.o

# Install
install: $(TARGET)
	cp $(TARGET) /usr/local/bin/

# Uninstall
uninstall:
	rm -f /usr/local/bin/$(TARGET)

# Run tests
test: $(TARGET)
	./$(TARGET) --test

.PHONY: all clean install uninstall test