package com.trackcart.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(1)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 120;
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    private static class RequestCounter {
        private final long windowStartEpochMinute;
        private final AtomicInteger count;

        public RequestCounter(long windowMinute) {
            this.windowStartEpochMinute = windowMinute;
            this.count = new AtomicInteger(1);
        }

        public int increment() {
            return count.incrementAndGet();
        }

        public long getWindowStartEpochMinute() {
            return windowStartEpochMinute;
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String clientIp = getClientIp(request);
        long currentMinute = Instant.now().getEpochSecond() / 60;

        RequestCounter counter = requestCounts.compute(clientIp, (key, existing) -> {
            if (existing == null || existing.getWindowStartEpochMinute() != currentMinute) {
                return new RequestCounter(currentMinute);
            }
            existing.increment();
            return existing;
        });

        // Clean up stale client entries periodically
        if (requestCounts.size() > 5000) {
            requestCounts.entrySet().removeIf(e -> e.getValue().getWindowStartEpochMinute() < currentMinute);
        }

        if (counter != null && counter.count.get() > MAX_REQUESTS_PER_MINUTE) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Too Many Requests\",\"message\":\"Rate limit exceeded. Maximum 120 requests per minute allowed.\",\"status\":429}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
