#version 450 core

layout (binding = 0) buffer PositionBuffer
{
    vec2 positions[];
};

out vec4 fragColor;

const float MaxRayMarchSteps = 100;
const float CircleRadius = 0.1;

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5 * vec2(1920, 1080)) / min(1920, 1080);

    vec2 rayOrigin = uv;
    vec2 rayDirection = vec2(0.0, 1.0);

    float minDistance = 1000.0;
    for (int i = 0; i < positions.length(); i++)
    {
        vec2 circleCenter = positions[i];
        vec2 oc = rayOrigin - circleCenter;

        float a = dot(rayDirection, rayDirection);
        float b = 2.0 * dot(oc, rayDirection);
        float c = dot(oc, oc) - CircleRadius * CircleRadius;

        float discriminant = b * b - 4.0 * a * c;
        if (discriminant >= 0.0)
        {
            float t = (-b - sqrt(discriminant)) / (2.0 * a);
            if (t > 0.0 && t < minDistance)
                minDistance = t;
        }
    }

    if (minDistance < 1000.0)
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    else
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
}

